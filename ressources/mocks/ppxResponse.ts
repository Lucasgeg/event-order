export const ppxResponse = {
  id: "5ad19936-fe21-4edb-91a5-2a655cf7009f",
  model: "sonar",
  created: 1767278278,
  usage: {
    prompt_tokens: 1858,
    completion_tokens: 2107,
    total_tokens: 3965,
    search_context_size: "low",
    cost: {
      input_tokens_cost: 0.002,
      output_tokens_cost: 0.002,
      request_cost: 0.005,
      total_cost: 0.009,
    },
  },
  citations: [
    "https://www.fooddatascrape.com/scrape-restaurant-menu-data.php",
    "https://www.klippa.com/en/ocr/data-fields/menu-cards/",
    "https://www.veryfi.com/restaurant-menu-ocr-api/",
    "https://github.com/rafalenden/pdf-menu-extractor",
    "https://docsbot.ai/prompts/technical/pdf-to-json-extractor",
    "https://apryse.com/blog/pdf-to-json-smart-data-extraction",
    "https://docparser.com",
  ],
  search_results: [
    {
      title: "How to Scrape Restaurant Menu Data?",
      url: "https://www.fooddatascrape.com/scrape-restaurant-menu-data.php",
      date: "2000-01-01",
      last_updated: "2025-11-29",
      snippet:
        "Learn how to scrape restaurant menu data, from accessing website HTML to parsing dish names, prices, and descriptions for valuable insights.",
      source: "web",
    },
    {
      title: "Menu card OCR - Data extraction and capturing - Klippa",
      url: "https://www.klippa.com/en/ocr/data-fields/menu-cards/",
      date: "2025-02-07",
      last_updated: "2025-12-19",
      snippet:
        "With our OCR software, you can automatically extract data from restaurant menus to ramp up your market research. ... The first step is sending a picture or a PDF ...",
      source: "web",
    },
    {
      title: "Restaurant Menu OCR API - Veryfi",
      url: "https://www.veryfi.com/restaurant-menu-ocr-api/",
      date: "2025-11-21",
      last_updated: "2025-12-30",
      snippet:
        "Scan. Extract. Optimize. Veryfi's AI-powered Restaurant Menu OCR API instantly transforms restaurant menus into structured data with exceptional accuracy.",
      source: "web",
    },
    {
      title:
        "rafalenden/pdf-menu-extractor: Library for extracting menu ... - GitHub",
      url: "https://github.com/rafalenden/pdf-menu-extractor",
      snippet:
        "Library for extracting menu items from restaurant PDF menus. - rafalenden/pdf-menu-extractor.",
      source: "web",
    },
    {
      title: "PDF to JSON Extractor - AI Prompt - DocsBot AI",
      url: "https://docsbot.ai/prompts/technical/pdf-to-json-extractor",
      date: "2024-12-03",
      last_updated: "2025-12-30",
      snippet:
        "Extracts key points and tables from a PDF into JSON format. Perfectly crafted free system prompt or custom instructions for ChatGPT, Gemini, and Claude chatbots ...",
      source: "web",
    },
    {
      title: "Automating Document Processing with Smart Data Extraction SDK",
      url: "https://apryse.com/blog/pdf-to-json-smart-data-extraction",
      date: "2025-12-09",
      last_updated: "2026-01-01",
      snippet:
        "Extract structured JSON from PDFs with Apryse Smart Data Extraction. Automate data labeling and document intake without templates or manual work.",
      source: "web",
    },
    {
      title: "Docparser - Automate Data Extraction from PDFs and Documents",
      url: "https://docparser.com",
      date: "2025-12-31",
      last_updated: "2026-01-01",
      snippet:
        "Extract important data from Word, PDF, CSV, XLS, TXT, XML and image files. Send to Excel, Google Sheets and 100's of other formats and integrations. Upload file.",
      source: "web",
    },
  ],
  object: "chat.completion",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content:
          '```json\n{\n  "menu": {\n    "categories": [\n      {\n        "name": "LES ENTREES",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Solitaire de foie gras de canard entier aux 5 baies, son sorbet grand Marnier, spéculos, chutney de figues, pain d\'épices du Pont Neuf",\n            "price": 16.00\n          },\n          {\n            "designation": "Tartare de thon mariné au citron vert, sorbet gingembre, piment d\'Espelette, à la fleur de sel, pomme granny Smith et cébettes",\n            "price": 16.00\n          },\n          {\n            "designation": "Mille-feuille au saumon fumé et mariné, son sorbet au yuzu, réduction De vinaigre au saveur framboise et combava, crème d\'aneth",\n            "price": 16.00\n          },\n          {\n            "designation": "Assiette périgourdine : composée de : Foie gras de canard entier Maison, magret de canard fumé, gésiers de canard tiède à la framboise, pain d\'épices du Pont Neuf et sa belle décoration",\n            "price": 17.00\n          },\n          {\n            "designation": "Symphonie de la mer : composée de : Langoustines bretonne, crevettes, Saint Jacques grillée, saumon fumé, blinis, sa décoration",\n            "price": 18.00\n          },\n          {\n            "designation": "Assiette entre terre et mer : composée de : Langoustines bretonne, crevettes, foie gras de canard entier maison, magret de canard fumé, pain d\'épices du Pont Neuf et sa belle décoration",\n            "price": 18.00\n          },\n          {\n            "designation": "Plateaux de fruits de mer : Au cours du jour Langoustines bretonne, araignée ou tourteau, huîtres, bigorneaux, crevettes...",\n            "price": 26.00\n          }\n        ]\n      },\n      {\n        "name": "LES POISSONS",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Pavé de saumon rôti, carotte de fane, sauce aux fruits de la passion",\n            "price": 17.00\n          },\n          {\n            "designation": "Nage de Saint Jacques grillées aux petits légumes, crème de lard fumé",\n            "price": 18.00\n          },\n          {\n            "designation": "Pavé de lieu jaune rôti, jardin de légumes, jus de langoustines",\n            "price": 18.00\n          },\n          {\n            "designation": "Dos de cabillaud rôti, risotto black curry, sauce champagne",\n            "price": 18.00\n          },\n          {\n            "designation": "Filet d\'églefin au tartare d\'algues, fenouil, beurre blanc au cumin",\n            "price": 18.00\n          },\n          {\n            "designation": "Médaillons de lotte rôtis, chou Pak Choi, sauce aux crustacés",\n            "price": 20.00\n          },\n          {\n            "designation": "Pavé de bar snacké, aux lentilles corail, asperges, sauce homard",\n            "price": 21.00\n          }\n        ]\n      },\n      {\n        "name": "LES VIANDES",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Suprême de pintadeau confit, pleurotes ailées, jus au poivre Timut",\n            "price": 18.00\n          },\n          {\n            "designation": "Filet mignon de porc rôti, écrasé de pomme de terre du Douvez, Jus réduit au poivre noir fumé",\n            "price": 18.00\n          },\n          {\n            "designation": "Magret de canard, au poivre vert de Kerala, poire et navet rôti",\n            "price": 18.00\n          },\n          {\n            "designation": "Pavé de veau rôti, pomme de terre grenailles du Douvez, sauce truffe",\n            "price": 18.00\n          },\n          {\n            "designation": "Pavé de veau rôti, tomate surprise bretonne, sauce au curry",\n            "price": 18.00\n          },\n          {\n            "designation": "Cuisse de canard confite, purée de carotte, pomme, sauce à l\'orange",\n            "price": 20.00\n          },\n          {\n            "designation": "Filet mignon de veau rôti, céleri fondant et polenta, sauce morilles",\n            "price": 22.00\n          },\n          {\n            "designation": "Tournedos de bœuf grillé, pomme de terre Anna, sauce Rossini",\n            "price": 22.00\n          }\n        ]\n      },\n      {\n        "name": "LES FROMAGES",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Trilogie des pâturages avec trois fromages affinés au choix",\n            "price": 5.00\n          },\n          {\n            "designation": "Croustillant de crêpe de blé noir au cœur de brie de Meaux coulant",\n            "price": 6.00\n          },\n          {\n            "designation": "Bonbons de chèvre frais, miel épicé tiède et tomates confites",\n            "price": 7.00\n          },\n          {\n            "designation": "Plateau du berger avec 7 sortes de fromages affinés selon vos goûts",\n            "price": 8.00\n          }\n        ]\n      },\n      {\n        "name": "LES DESSERTS",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Gâteaux des Mariés : son coulis et son décor : 2 au choix maximum : Fraisier (selon la saison) - Entremet framboise noix coco Framboisier - Entremet spéculos et gianduja Opéra (chocolat et café) - Entremet fraise des bois Croustillant aux 3 chocolats - Scintillant au chocolat et caramel Feuillantine chocolat amer - Croustillant framboise et passion Entremet poire caramel - Entremet rocher chocolat praliné",\n            "price": 9.00\n          },\n          {\n            "designation": "Pièce montée avec 3 choux et nougatine, selon le modèle",\n            "price": 10.00\n          },\n          {\n            "designation": "Wedding ou Nuke ou Numbers cake, selon le modèle demandé",\n            "price": 13.00\n          },\n          {\n            "designation": "Assiette gourmande de 3 mini desserts au choix et son sorbet",\n            "price": 10.00\n          },\n          {\n            "designation": "Pyramide de macarons idéal pour accompagner la cascade de champagne La pièce",\n            "price": 1.50\n          }\n        ]\n      },\n      {\n        "name": "MENU ENFANT",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Assiette d\'assortiments de charcuteries et de crudités de saison Sauté de volaille à la crème, pommes de terre grenailles rissolées Dessert (tarte aux pommes ou glaces)",\n            "price": 15.00\n          }\n        ]\n      },\n      {\n        "name": "LES SUPPLEMENTS",\n        "subCategories": [],\n        "products": [\n          {\n            "designation": "Café, thé, sucre, petit chocolat \' service à table \'",\n            "price": 2.00\n          },\n          {\n            "designation": "Ou bien sur buffet en libre-service disponible toute la nuit",\n            "price": 1.50\n          },\n          {\n            "designation": "Délice des jeunes mariés (un sorbet et une liqueur au choix)",\n            "price": 4.00\n          },\n          {\n            "designation": "Soupe à l\'oignon (gruyère râpé, croûtons, bols et cuillères jetables)",\n            "price": 4.00\n          },\n          {\n            "designation": "Café, Dessert pour supplément d\'invités",\n            "price": 15.00\n          },\n          {\n            "designation": "Menu animateur, photographe, organisateur, baby-sitter)",\n            "price": 20.00\n          },\n          {\n            "designation": "Forfait boissons : Par personne adulte et composé des vins suivant : (Château Tour des Graves I Bouteille pour 4 en blanc et I Bt pour 3 en rouge, Isatis rosé I Bt pour 6, Plancoët plate et gazeuse en bouteille verre I Bt pour 3)",\n            "price": 7.00\n          }\n        ]\n      }\n    ]\n  }\n}\n```',
      },
      delta: {
        role: "assistant",
        content: "",
      },
      finish_reason: "stop",
    },
  ],
};
