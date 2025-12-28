import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface UpdateOrderBody {
  clientName?: string;
  pickupDate?: string;
  items?: OrderItemInput[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateOrderBody = await request.json();
    const { clientName, pickupDate, items } = body;

    // 1. Update basic fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (clientName) updateData.clientName = clientName;
    if (pickupDate) updateData.pickupDate = new Date(pickupDate);

    // 2. Update items if provided
    if (items && Array.isArray(items)) {
      // Transaction to replace items: delete old ones, create new ones
      // Or smarter update. For simplicity: delete all and recreate is easiest but changes IDs.
      // Better: use Prisma's transaction.

      await prisma.$transaction(async (tx) => {
        // Update order details
        await tx.order.update({
          where: { id },
          data: updateData,
        });

        // Delete existing items
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Create new items
        if (items.length > 0) {
          await tx.orderItem.createMany({
            data: items.map((item) => ({
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
            })),
          });
        }
      });
    } else {
      // Just update fields
      await prisma.order.update({
        where: { id },
        data: updateData,
      });
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error updating order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
