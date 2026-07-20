import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@clerk/nextjs/server";

interface OrderItemInput {
  /** Présent = ligne d'origine (valeurs figées conservées) ; absent = nouvelle ligne */
  id?: string;
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
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // Pagination & Search params
  const clientName = searchParams.get("clientName");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

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

    if (clientName) {
      // If searching by client name, ignore regular date range filters unless specified
      // but we still likely want to respect tenantId
      whereClause = {
        clientName: {
          contains: clientName,
          mode: "insensitive",
        },
      };
    } else if (startDateParam && endDateParam) {
      // Filter by date range
      const start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);

      whereClause = {
        pickupDate: {
          gte: start,
          lte: end,
        },
      };
    } else if (dateParam) {
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

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { ...whereClause, tenantId: orgId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: skip,
      }),
      prisma.order.count({
        where: { ...whereClause, tenantId: orgId },
      }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 },
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
        { status: 400 },
      );
    }

    // Validate items
    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error: "Invalid item: must have productId and integer quantity > 0",
          },
          { status: 400 },
        );
      }
    }

    // Le prix et la désignation sont figés côté serveur au moment de la commande
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: items.map((item) => item.productId) },
        tenantId: orgId,
      },
      select: { id: true, price: true, designation: true },
    });
    const productById = new Map(dbProducts.map((p) => [p.id, p]));

    if (items.some((item) => !productById.has(item.productId))) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
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
            unitPrice: productById.get(item.productId)!.price,
            designation: productById.get(item.productId)!.designation,
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
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
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

      updateData.items = {
        deleteMany: {}, // Delete all existing items
        create: items.map((item) => {
          const frozen = item.id ? frozenByItemId.get(item.id) : undefined;
          const current = currentByProductId.get(item.productId)!;
          const keepFrozen = frozen && frozen.productId === item.productId;
          return {
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            unitPrice: keepFrozen ? frozen.unitPrice : current.price,
            designation: keepFrozen ? frozen.designation : current.designation,
          };
        }),
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
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

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
