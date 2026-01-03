import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@clerk/nextjs/server";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderBody {
  clientName: string;
  pickupDate: string;
  items: OrderItemInput[];
}

interface UpdateOrderBody {
  id: string;
  clientName?: string;
  pickupDate?: string;
  items?: OrderItemInput[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const dateParam = searchParams.get("date");

  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause: Prisma.OrderWhereInput = {};
    let orderBy: Prisma.OrderOrderByWithRelationInput = { createdAt: "desc" };

    const now = new Date();
    // Set to beginning of day to include orders for today in "upcoming"
    now.setHours(0, 0, 0, 0);

    if (dateParam) {
      // Filter by specific date
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause = {
        pickupDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    } else if (period === "upcoming") {
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      whereClause = {
        pickupDate: {
          gte: now,
          lte: oneMonthLater,
        },
      };
      orderBy = { pickupDate: "asc" };
    } else if (period === "past") {
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      whereClause = {
        pickupDate: {
          lt: now,
          gte: sixMonthsAgo,
        },
      };
      orderBy = { pickupDate: "desc" };
    }

    const orders = await prisma.order.findMany({
      where: { ...whereClause, tenantId: orgId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: orderBy,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
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

    const body: CreateOrderBody = await request.json();
    const { clientName, pickupDate, items } = body;

    if (
      !clientName ||
      !pickupDate ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: clientName, pickupDate, and items (array)",
        },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item: must have productId and quantity > 0" },
          { status: 400 }
        );
      }
    }

    const order = await prisma.order.create({
      data: {
        clientName,
        pickupDate: new Date(pickupDate),
        tenantId: orgId,
        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: UpdateOrderBody = await request.json();
    const { id, clientName, pickupDate, items } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Prepare update data
    const updateData: Prisma.OrderUpdateInput = {};
    if (clientName) updateData.clientName = clientName;
    if (pickupDate) updateData.pickupDate = new Date(pickupDate);

    // If items are provided, we replace them
    if (items && Array.isArray(items)) {
      // Validate items
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return NextResponse.json(
            { error: "Invalid item: must have productId and quantity > 0" },
            { status: 400 }
          );
        }
      }

      updateData.items = {
        deleteMany: {}, // Delete all existing items
        create: items.map((item) => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
        })),
      };
    }

    const order = await prisma.order.update({
      where: { id, tenantId: orgId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error updating order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Error deleting order" },
      { status: 500 }
    );
  }
}
