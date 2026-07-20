import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface OrderItemInput {
  /** Présent = ligne d'origine (valeurs figées conservées) ; absent = nouvelle ligne */
  id?: string;
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: { id, tenantId: orgId },
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
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId, orgRole } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json(
        { error: "Réservé aux administrateurs" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body: UpdateOrderBody = await request.json();
    const { clientName, pickupDate, items } = body;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (
          !item.productId ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid item: must have productId and integer quantity > 0",
            },
            { status: 400 },
          );
        }
      }
    }

    const existingOrder = await prisma.order.findFirst({
      where: { id, tenantId: orgId },
      select: { id: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

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

      // Une ligne renvoyée avec son id d'origine garde ses valeurs figées ;
      // une ligne sans id (ajoutée, ou supprimée puis recréée) prend les
      // valeurs actuelles du catalogue
      const [existingItems, dbProducts] = await Promise.all([
        prisma.orderItem.findMany({
          where: { orderId: id, order: { tenantId: orgId } },
          select: {
            id: true,
            productId: true,
            unitPrice: true,
            designation: true,
          },
        }),
        prisma.product.findMany({
          where: {
            id: { in: items.map((item) => item.productId) },
            tenantId: orgId,
          },
          select: { id: true, price: true, designation: true },
        }),
      ]);
      const frozenByItemId = new Map(existingItems.map((i) => [i.id, i]));
      const currentByProductId = new Map(dbProducts.map((p) => [p.id, p]));

      if (items.some((item) => !currentByProductId.has(item.productId))) {
        return NextResponse.json({ error: "Unknown product" }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Update order details
        await tx.order.update({
          where: { id, tenantId: orgId },
          data: updateData,
        });

        // Delete existing items
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Create new items
        if (items.length > 0) {
          await tx.orderItem.createMany({
            data: items.map((item) => {
              const frozen = item.id ? frozenByItemId.get(item.id) : undefined;
              const current = currentByProductId.get(item.productId)!;
              const keepFrozen = frozen && frozen.productId === item.productId;
              return {
                orderId: id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: keepFrozen ? frozen.unitPrice : current.price,
                designation: keepFrozen
                  ? frozen.designation
                  : current.designation,
              };
            }),
          });
        }
      });
    } else {
      // Just update fields
      await prisma.order.update({
        where: { id, tenantId: orgId },
        data: updateData,
      });
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findFirst({
      where: { id, tenantId: orgId },
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { orgId, orgRole } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orgRole !== "org:admin") {
      return NextResponse.json(
        { error: "Réservé aux administrateurs" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const result = await prisma.order.deleteMany({
      where: { id, tenantId: orgId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Error deleting order" },
      { status: 500 },
    );
  }
}
