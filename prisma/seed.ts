import { prisma } from "../lib/prisma";

// const prisma = new PrismaClient({});

const TENANT_ID = "org_37kbhyOzOHRxQk7hWkySwnQmuYy";

async function main() {
  console.log("Start seeding...");

  // 1. Create or Update Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: {
      id: TENANT_ID,
      name: "Cahier du Chef Demo",
    },
  });

  console.log(`Tenant created/found: ${tenant.id}`);

  // 2. Nettoyage : on repart d'une base vierge pour ce tenant à chaque
  // exécution, sinon catégories/produits se dupliquent à chaque relance.
  // Ordre imposé par les contraintes de clé étrangère (Restrict par défaut
  // sur Product -> Category/SubCategory et OrderItem -> Product) : les
  // commandes (et leurs lignes, en cascade) doivent partir avant les
  // produits, eux-mêmes avant les (sous-)catégories.
  await prisma.order.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.product.deleteMany({ where: { tenantId: TENANT_ID } });
  await prisma.subCategory.deleteMany({
    where: { category: { tenantId: TENANT_ID } },
  });
  await prisma.category.deleteMany({ where: { tenantId: TENANT_ID } });

  console.log("Cleared existing categories, products and orders for tenant");

  // 3. Create Categories and SubCategories
  const categoriesData = [
    {
      name: "Pièces Cocktail",
      subCategories: ["Salées Froides", "Salées Chaudes", "Sucrées"],
    },
    {
      name: "Plateaux Repas",
      subCategories: ["Tradition", "Végétarien", "Prestige"],
    },
    {
      name: "Buffets",
      subCategories: ["Entrées", "Plats", "Fromages & Desserts"],
    },
    {
      name: "Boissons",
      subCategories: ["Vins", "Champagnes", "Softs & Eaux"],
    },
  ];

  const createdCategories = [];

  for (const catData of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        tenantId: TENANT_ID,
        subCategories: {
          create: catData.subCategories.map((name) => ({ name })),
        },
      },
      include: {
        subCategories: true,
      },
    });
    createdCategories.push(category);
  }

  console.log(`Created ${createdCategories.length} categories`);

  // 4. Create Products
  const productsData = [
    // Pièces Cocktail
    {
      name: "Navette Mousse de Canard",
      price: 1.5,
      catIndex: 0,
      subCatIndex: 0,
    },
    { name: "Verrine Saumon Avocat", price: 2.0, catIndex: 0, subCatIndex: 0 },
    { name: "Mini Burger Boeuf", price: 2.5, catIndex: 0, subCatIndex: 1 },
    { name: "Accras de Morue", price: 1.8, catIndex: 0, subCatIndex: 1 },
    { name: "Macaron Framboise", price: 1.8, catIndex: 0, subCatIndex: 2 },
    { name: "Mini Tartelette Citron", price: 1.6, catIndex: 0, subCatIndex: 2 },

    // Plateaux Repas
    {
      name: "Plateau Tradition (Poulet Rôti)",
      price: 22,
      catIndex: 1,
      subCatIndex: 0,
    },
    {
      name: "Plateau Végé (Quinoa & Légumes)",
      price: 20,
      catIndex: 1,
      subCatIndex: 1,
    },
    {
      name: "Plateau Prestige (Foie Gras & Magret)",
      price: 35,
      catIndex: 1,
      subCatIndex: 2,
    },

    // Buffets
    {
      name: "Salade de Pâtes au Pesto",
      price: 15,
      catIndex: 2,
      subCatIndex: 0,
    },
    { name: "Saumon Entier Bellevue", price: 80, catIndex: 2, subCatIndex: 1 },
    {
      name: "Plateau de Fromages Affinés",
      price: 45,
      catIndex: 2,
      subCatIndex: 2,
    },
    { name: "Farandole de Desserts", price: 35, catIndex: 2, subCatIndex: 2 },

    // Boissons
    { name: "Château Margaux 2015", price: 120, catIndex: 3, subCatIndex: 0 },
    { name: "Côtes du Rhône", price: 18, catIndex: 3, subCatIndex: 0 },
    { name: "Champagne Ruinart", price: 85, catIndex: 3, subCatIndex: 1 },
    { name: "Coca Cola 1.5L", price: 4, catIndex: 3, subCatIndex: 2 },
    { name: "Eau Minérale 1L", price: 2, catIndex: 3, subCatIndex: 2 },
  ];

  const createdProducts = [];

  for (const prod of productsData) {
    const category = createdCategories[prod.catIndex];
    const subCategory = category.subCategories[prod.subCatIndex];

    const product = await prisma.product.create({
      data: {
        designation: prod.name,
        price: prod.price,
        tenantId: TENANT_ID,
        categoryId: category.id,
        subCategoryId: subCategory.id,
      },
    });
    createdProducts.push(product);
  }

  console.log(`Created ${createdProducts.length} products`);

  // 5. Create Orders
  const clientNames = [
    "Jean Dupont",
    "Marie Martin",
    "Pierre Durand",
    "Sophie Leroy",
    "Lucas Moreau",
    "Emma Petit",
    "Thomas Girard",
    "Léa Bonnet",
    "Nicolas Roux",
    "Julie Michel",
  ];

  // Dates relatives à "maintenant" (et pas calendaires fixes) pour que les
  // commandes générées restent visibles dans les filtres upcoming/past de
  // l'UI (respectivement +1 mois et -6 mois) quel que soit le jour où le
  // seed est exécuté.
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 15);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 15);

  for (let i = 0; i < 30; i++) {
    const randomClient =
      clientNames[Math.floor(Math.random() * clientNames.length)];

    // Random date between start and end
    const randomTime =
      startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);

    // Random items (1 to 5 items per order)
    const numItems = Math.floor(Math.random() * 5) + 1;
    const orderItems = [];

    for (let j = 0; j < numItems; j++) {
      const randomProduct =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 quantity

      orderItems.push({
        productId: randomProduct.id,
        quantity: quantity,
        unitPrice: randomProduct.price,
        designation: randomProduct.designation,
      });
    }

    await prisma.order.create({
      data: {
        clientName: randomClient,
        pickupDate: randomDate,
        tenantId: TENANT_ID,
        items: {
          create: orderItems,
        },
      },
    });
  }

  console.log("Created 30 orders");
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
