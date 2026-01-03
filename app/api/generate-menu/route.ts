import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument } from "pdf-lib";
import { auth } from "@clerk/nextjs/server";

// Types based on the AI response structure
interface AIProduct {
  designation: string;
  price: number;
}

interface AISubCategory {
  name: string | null;
  products: AIProduct[];
}

interface AICategory {
  name: string;
  subCategories?: AISubCategory[];
  products?: AIProduct[];
}

interface AIMenuResponse {
  menu: {
    categories: AICategory[];
  };
}

const PROMPT =
  'Tu es un expert en extraction de cartes de restaurant (menus) à partir de texte OCR issu de PDF.Objectif :À partir du texte fourni, tu dois extraire les catégories, sous-catégories et produits du menu, et retourner UNIQUEMENT un objet JSON valide, sans markdown, sans texte explicatif, sans commentaire.Tu dois retourner exactement ce JSON (même structure, mêmes clés) :{  "menu": {    "categories": [      {        "name": "Nom de la catégorie",        "subCategories": [          {            "name": "Nom de sous-catégorie ou null",            "products": [              {                "designation": "Nom exact du produit (version courte)",                "price": 12.5              }            ]          }        ],        "products": [          {            "designation": "Produit direct en catégorie (version courte)",            "price": 10.0          }        ]      }    ]  }}Règles de structure :- "menu" : objet racine.- "categories" : tableau de catégories principales du menu.- category.name : string (exemples : "Entrées", "Plats", "Desserts", "Boissons", "Glaces").- Chaque catégorie doit être UNIQUE (pas de doublons de name).- "subCategories" : tableau de sous-catégories liées à une catégorie.- subCategory.name : string ou null si aucune sous-catégorie explicite n’est présente dans le texte.- "products" : tableau de produits.- products.designation : string (nom du produit).- products.price : nombre (float) avec point décimal si nécessaire (ex : 12, 12.5, 8.0).Règles métier :- Si le menu ne contient PAS de sous-catégorie explicite pour une catégorie, mets tous les produits de cette catégorie dans categories[].products et laisse categories[].subCategories vide (NE crée PAS de sous-catégorie inutile avec name = null).- Si le menu contient DES sous-catégories explicites (par exemple “Viandes”, “Poissons” sous “Plats”), utilise categories[].subCategories[].name pour ces sous-catégories et mets les produits dedans.- Si un même bloc de texte liste plusieurs produits très similaires (ex : liste de gâteaux variés sous un même intitulé), découpe-les en produits séparés si possible, sinon laisse un seul produit mais garde un nom clair.- Les noms de catégories ne doivent PAS être dupliqués : s’il y a plusieurs occurrences de “Glaces”, regroupe-les dans UNE seule catégorie "Glaces".- Les noms de produits (designation) doivent être UNIQUES dans l’ensemble du menu. Si deux produits identiques apparaissent plusieurs fois, ne les garde qu’une seule fois ou bien différencie-les légèrement (ex : ajouter une précision courte).- Si le nom d’un produit est trop long (phrase complète), raccourcis-le pour qu’il reste explicite, par exemple :  - garde l’élément principal du plat (ex : "Foie gras de canard, chutney de figues" au lieu de toute la phrase marketing).  - supprime les détails de décoration trop longs.Formatage et contraintes de sortie :- Retourne UNIQUEMENT l’objet JSON, sans texte avant/après.- NE pas entourer le JSON de ``` ou ```json.- NE pas ajouter de commentaires, d’explications ou d’autres champs que ceux décrits.- Assure-toi que le JSON est syntaxiquement valide (guillemets doubles pour les clés et les strings, pas de virgule finale).Texte du menu à analyser :';

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Prepare PDF and OCR
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pageCount = pdfDoc.getPageCount();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allParsedResults: any[] = [];

    const callOcr = async (blob: Blob) => {
      const ocrFormData = new FormData();
      ocrFormData.append("file", blob, "file.pdf");
      ocrFormData.append("language", "fre");
      ocrFormData.append("isTable", "true");
      ocrFormData.append("OCREngine", "1");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: {
          apikey: process.env.OCR_API_KEY || "",
        },
        body: ocrFormData,
      });
      return await response.json();
    };

    if (pageCount <= 3) {
      const blob = new Blob([fileBuffer], { type: "application/pdf" });
      const ocrData = await callOcr(blob);

      if (ocrData.IsErroredOnProcessing) {
        return NextResponse.json(
          { error: ocrData.ErrorMessage },
          { status: 500 }
        );
      }
      if (ocrData.ParsedResults) {
        allParsedResults.push(...ocrData.ParsedResults);
      }
    } else {
      // Split into chunks of 3 pages
      const chunkSize = 3;
      for (let i = 0; i < pageCount; i += chunkSize) {
        const subDoc = await PDFDocument.create();
        const pageIndices = [];
        for (let j = 0; j < chunkSize && i + j < pageCount; j++) {
          pageIndices.push(i + j);
        }
        const copiedPages = await subDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => subDoc.addPage(page));
        const pdfBytes = await subDoc.save();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const ocrData = await callOcr(blob);

        if (ocrData.IsErroredOnProcessing) {
          return NextResponse.json(
            { error: `Error on chunk ${i}: ${ocrData.ErrorMessage}` },
            { status: 500 }
          );
        }
        if (ocrData.ParsedResults) {
          allParsedResults.push(...ocrData.ParsedResults);
        }
      }
    }

    if (allParsedResults.length === 0) {
      return NextResponse.json(
        { error: "No text found in PDF" },
        { status: 400 }
      );
    }

    // 2. Clean text
    let texteComplet = allParsedResults
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result: any) => result.ParsedText
      )
      .join(" ");

    texteComplet = texteComplet
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    texteComplet = texteComplet.replace(/[“”"«»]/g, "'");
    texteComplet = texteComplet.replace(/(\d+)(,|\.)(\d{1,2})\s*€?/gi, "$1.$3");
    texteComplet = texteComplet.replace(/'/g, "\\'");

    const mots = texteComplet.split(" ").slice(0, 4000);
    const cleanedText = mots.join(" ");

    // 3. Call Perplexity
    const perplexityBody = {
      model: "sonar",
      messages: [
        {
          role: "user",
          content: `${PROMPT}${cleanedText}`,
        },
      ],
      max_tokens: 2500,
      temperature: 0.1,
    };

    const perplexityResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(perplexityBody),
      }
    );

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      return NextResponse.json(
        {
          error: `Perplexity API error: ${perplexityResponse.status} ${errorText}`,
        },
        { status: perplexityResponse.status }
      );
    }

    const perplexityData = await perplexityResponse.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiResponseContent = (perplexityData as any).choices[0].message
      .content;

    // 1. Enlève markdown ```
    const jsonStr = aiResponseContent
      .replace(/```json\s*/g, "")
      .replace(/```/g, "")
      .trim();

    const menuParse = JSON.parse(jsonStr) as AIMenuResponse;

    // 4. Save to Database
    if (menuParse.menu && menuParse.menu.categories) {
      for (const categoryData of menuParse.menu.categories) {
        // Create Category
        const category = await prisma.category.create({
          data: {
            name: categoryData.name,
            tenantId: orgId,
          },
        });

        // Create Direct Products
        if (categoryData.products && categoryData.products.length > 0) {
          for (const productData of categoryData.products) {
            await prisma.product.create({
              data: {
                designation: productData.designation,
                price: productData.price,
                categoryId: category.id,
                tenantId: orgId,
              },
            });
          }
        }

        // Create SubCategories and their Products
        if (
          categoryData.subCategories &&
          categoryData.subCategories.length > 0
        ) {
          for (const subCatData of categoryData.subCategories) {
            if (subCatData.name) {
              const subCategory = await prisma.subCategory.create({
                data: {
                  name: subCatData.name,
                  categoryId: category.id,
                },
              });

              if (subCatData.products && subCatData.products.length > 0) {
                for (const productData of subCatData.products) {
                  await prisma.product.create({
                    data: {
                      designation: productData.designation,
                      price: productData.price,
                      categoryId: category.id,
                      subCategoryId: subCategory.id,
                      tenantId: orgId,
                    },
                  });
                }
              }
            } else {
              // If subcategory name is null, add products to category directly
              if (subCatData.products && subCatData.products.length > 0) {
                for (const productData of subCatData.products) {
                  await prisma.product.create({
                    data: {
                      designation: productData.designation,
                      price: productData.price,
                      categoryId: category.id,
                      tenantId: orgId,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, menu: menuParse });
  } catch (error) {
    console.error("Error in generate-menu:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
