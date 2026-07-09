import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [categories, subCategories, products] = await Promise.all([
      prisma.category.findMany({
        where: { tenantId: orgId },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.subCategory.findMany({
        where: {
          category: {
            tenantId: orgId,
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.product.findMany({
        where: { tenantId: orgId },
        orderBy: [{ isActive: "desc" }, { designation: "asc" }],
      }),
    ]);

    return NextResponse.json({
      categories,
      subCategories,
      products,
    });
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
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case "category":
        result = await prisma.category.create({
          data: { name: data.name, tenantId: orgId },
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
            tenantId: orgId,
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
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "category":
        result = await prisma.category.updateMany({
          where: { id, tenantId: orgId },
          data: { name: data.name },
        });
        break;
      case "subCategory":
        result = await prisma.subCategory.updateMany({
          where: { id, category: { tenantId: orgId } },
          data: {
            name: data.name,
            categoryId: data.categoryId,
          },
        });
        break;
      case "product":
        result = await prisma.product.updateMany({
          where: { id, tenantId: orgId },
          data: {
            designation: data.designation,
            price: data.price ? parseFloat(data.price) : undefined,
            categoryId: data.categoryId,
            subCategoryId: data.subCategoryId,
            isActive: data.isActive,
          },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        result = await prisma.category.deleteMany({
          where: { id, tenantId: orgId },
        });
        break;
      case "subCategory":
        result = await prisma.subCategory.deleteMany({
          where: { id, category: { tenantId: orgId } },
        });
        break;
      case "product":
        result = await prisma.product.deleteMany({
          where: { id, tenantId: orgId },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Error deleting item" }, { status: 500 });
  }
}
