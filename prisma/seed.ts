import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Start seeding...");

  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();

  // AvailableDay is skipped as requested

  // 1. Pains
  const pains = await prisma.category.create({
    data: {
      name: "Pains",
      subCategories: {
        create: [{ name: "Classiques" }, { name: "Spéciaux" }],
      },
    },
    include: { subCategories: true },
  });

  const subPainsClassiques = pains.subCategories.find(
    (s) => s.name === "Classiques"
  );
  const subPainsSpeciaux = pains.subCategories.find(
    (s) => s.name === "Spéciaux"
  );

  if (subPainsClassiques) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Baguette Tradition",
          price: 1.2,
          categoryId: pains.id,
          subCategoryId: subPainsClassiques.id,
        },
        {
          designation: "Baguette Ordinaire",
          price: 1.0,
          categoryId: pains.id,
          subCategoryId: subPainsClassiques.id,
        },
        {
          designation: "Pain de Campagne",
          price: 2.5,
          categoryId: pains.id,
          subCategoryId: subPainsClassiques.id,
        },
      ],
    });
  }

  if (subPainsSpeciaux) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Pain Complet",
          price: 2.8,
          categoryId: pains.id,
          subCategoryId: subPainsSpeciaux.id,
        },
        {
          designation: "Pain aux Céréales",
          price: 3.0,
          categoryId: pains.id,
          subCategoryId: subPainsSpeciaux.id,
        },
      ],
    });
  }

  // 2. Viennoiseries
  const viennoiseries = await prisma.category.create({
    data: {
      name: "Viennoiseries",
      subCategories: {
        create: [{ name: "Feuilletés" }, { name: "Briochés" }],
      },
    },
    include: { subCategories: true },
  });

  const subViennoiseriesFeuilletes = viennoiseries.subCategories.find(
    (s) => s.name === "Feuilletés"
  );
  const subViennoiseriesBrioches = viennoiseries.subCategories.find(
    (s) => s.name === "Briochés"
  );

  if (subViennoiseriesFeuilletes) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Croissant",
          price: 1.1,
          categoryId: viennoiseries.id,
          subCategoryId: subViennoiseriesFeuilletes.id,
        },
        {
          designation: "Pain au Chocolat",
          price: 1.2,
          categoryId: viennoiseries.id,
          subCategoryId: subViennoiseriesFeuilletes.id,
        },
        {
          designation: "Chausson aux Pommes",
          price: 1.8,
          categoryId: viennoiseries.id,
          subCategoryId: subViennoiseriesFeuilletes.id,
        },
      ],
    });
  }

  if (subViennoiseriesBrioches) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Brioche au Sucre",
          price: 1.5,
          categoryId: viennoiseries.id,
          subCategoryId: subViennoiseriesBrioches.id,
        },
        {
          designation: "Pain au Lait",
          price: 1.0,
          categoryId: viennoiseries.id,
          subCategoryId: subViennoiseriesBrioches.id,
        },
      ],
    });
  }

  // 3. Pâtisseries
  const patisseries = await prisma.category.create({
    data: {
      name: "Pâtisseries",
      subCategories: {
        create: [{ name: "Individuelles" }, { name: "A partager" }],
      },
    },
    include: { subCategories: true },
  });

  const subPatisseriesIndiv = patisseries.subCategories.find(
    (s) => s.name === "Individuelles"
  );
  const subPatisseriesPartager = patisseries.subCategories.find(
    (s) => s.name === "A partager"
  );

  if (subPatisseriesIndiv) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Éclair au Chocolat",
          price: 2.8,
          categoryId: patisseries.id,
          subCategoryId: subPatisseriesIndiv.id,
        },
        {
          designation: "Religieuse Café",
          price: 3.2,
          categoryId: patisseries.id,
          subCategoryId: subPatisseriesIndiv.id,
        },
        {
          designation: "Tartelette Citron",
          price: 3.5,
          categoryId: patisseries.id,
          subCategoryId: subPatisseriesIndiv.id,
        },
      ],
    });
  }

  if (subPatisseriesPartager) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Tarte aux Pommes (6 pers)",
          price: 18.0,
          categoryId: patisseries.id,
          subCategoryId: subPatisseriesPartager.id,
        },
        {
          designation: "Flan Pâtissier (4 pers)",
          price: 12.0,
          categoryId: patisseries.id,
          subCategoryId: subPatisseriesPartager.id,
        },
      ],
    });
  }

  // 4. Snacking
  const snacking = await prisma.category.create({
    data: {
      name: "Snacking",
      subCategories: {
        create: [
          { name: "Sandwichs" },
          { name: "Salades" },
          { name: "Boissons" },
        ],
      },
    },
    include: { subCategories: true },
  });

  const subSnackingSandwichs = snacking.subCategories.find(
    (s) => s.name === "Sandwichs"
  );
  const subSnackingSalades = snacking.subCategories.find(
    (s) => s.name === "Salades"
  );
  const subSnackingBoissons = snacking.subCategories.find(
    (s) => s.name === "Boissons"
  );

  if (subSnackingSandwichs) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Jambon Beurre",
          price: 4.5,
          categoryId: snacking.id,
          subCategoryId: subSnackingSandwichs.id,
        },
        {
          designation: "Poulet Crudités",
          price: 5.2,
          categoryId: snacking.id,
          subCategoryId: subSnackingSandwichs.id,
        },
      ],
    });
  }

  if (subSnackingSalades) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Salade César",
          price: 8.5,
          categoryId: snacking.id,
          subCategoryId: subSnackingSalades.id,
        },
        {
          designation: "Salade Niçoise",
          price: 8.0,
          categoryId: snacking.id,
          subCategoryId: subSnackingSalades.id,
        },
      ],
    });
  }

  if (subSnackingBoissons) {
    await prisma.product.createMany({
      data: [
        {
          designation: "Coca Cola 33cl",
          price: 1.5,
          categoryId: snacking.id,
          subCategoryId: subSnackingBoissons.id,
        },
        {
          designation: "Eau Minérale 50cl",
          price: 1.0,
          categoryId: snacking.id,
          subCategoryId: subSnackingBoissons.id,
        },
      ],
    });
  }

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
