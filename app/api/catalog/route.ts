import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [categories, subCategories, products] = await Promise.all([
      prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      prisma.subCategory.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      prisma.product.findMany({
        orderBy: {
          designation: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      categories,
      subCategories,
      products,
    });
    return NextResponse.json({ message: "test" });
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json(
      { error: "Error fetching catalog" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case "category":
        result = await prisma.category.create({
          data: { name: data.name },
        });
        break;
      case "subCategory":
        result = await prisma.subCategory.create({
          data: {
            name: data.name,
            categoryId: data.categoryId,
          },
        });
        break;
      case "product":
        result = await prisma.product.create({
          data: {
            designation: data.designation,
            price: parseFloat(data.price),
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId || null,
          },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: "Error creating item" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;
    console.log("🚀 ~ PUT ~ body:", body);

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "category":
        result = await prisma.category.update({
          where: { id },
          data: { name: data.name },
        });
        break;
      case "subCategory":
        result = await prisma.subCategory.update({
          where: { id },
          data: {
            name: data.name,
            categoryId: data.categoryId,
          },
        });
        break;
      case "product":
        result = await prisma.product.update({
          where: { id },
          data: {
            designation: data.designation,
            price: data.price ? parseFloat(data.price) : undefined,
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId,
          },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json(
        { error: "Type and ID are required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "category":
        result = await prisma.category.delete({ where: { id } });
        break;
      case "subCategory":
        result = await prisma.subCategory.delete({ where: { id } });
        break;
      case "product":
        result = await prisma.product.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Error deleting item" }, { status: 500 });
  }
}
