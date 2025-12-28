import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
      where: { id },
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
