import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { signAdminSession } from "@/lib/adminSession";

// Test d'intégration contre un vrai Postgres (docker-compose.yml) : c'est
// l'invariant identifié comme le plus critique dans TODO.md — le scoping
// tenant réel, qu'un Prisma mocké ne peut pas garantir (voir la limitation
// documentée dans docs/adr/0003-compte-unique-pin-admin.md).
//
// Seuls Clerk (auth) et le cookie de session admin sont mockés : ce ne sont
// pas eux qu'on teste ici, mais la frontière `tenantId` posée sur les
// requêtes Prisma réelles.

let currentOrgId = "";
let currentCookie: string | null = null;

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ orgId: currentOrgId })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "admin_session" && currentCookie
        ? { name, value: currentCookie }
        : undefined,
  })),
}));

import { PUT, DELETE } from "./route";

const TENANT_A = "test_tenant_a";
const TENANT_B = "test_tenant_b";

let orderA: { id: string };

async function wipeTestTenants() {
  await prisma.order.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } });
  await prisma.product.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } });
  await prisma.category.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } });
  await prisma.tenant.deleteMany({ where: { id: { in: [TENANT_A, TENANT_B] } } });
}

beforeAll(async () => {
  await wipeTestTenants();

  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A, name: "Tenant A (test)", pinCodeHash: "x" },
      { id: TENANT_B, name: "Tenant B (test)", pinCodeHash: "x" },
    ],
  });

  const category = await prisma.category.create({
    data: { name: "Cat", tenantId: TENANT_A },
  });
  const product = await prisma.product.create({
    data: {
      designation: "Produit A",
      price: 10,
      tenantId: TENANT_A,
      categoryId: category.id,
    },
  });
  orderA = await prisma.order.create({
    data: {
      clientName: "Client A",
      pickupDate: new Date(),
      tenantId: TENANT_A,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            unitPrice: 10,
            designation: "Produit A",
          },
        ],
      },
    },
  });
});

afterAll(async () => {
  await wipeTestTenants();
  await prisma.$disconnect();
});

function putRequest(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Tenant scoping on /api/orders (real Postgres)", () => {
  it("rejects PUT without a valid admin session (403), order untouched", async () => {
    currentOrgId = TENANT_A;
    currentCookie = null;

    const res = await PUT(putRequest({ id: orderA.id, clientName: "Hacked" }));
    expect(res.status).toBe(403);

    const stillOriginal = await prisma.order.findUniqueOrThrow({
      where: { id: orderA.id },
    });
    expect(stillOriginal.clientName).toBe("Client A");
  });

  it("accepts PUT with a valid admin session for the owning tenant", async () => {
    currentOrgId = TENANT_A;
    currentCookie = signAdminSession(TENANT_A);

    const res = await PUT(
      putRequest({ id: orderA.id, clientName: "Client A modifié" }),
    );
    expect(res.status).toBe(200);

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: orderA.id },
    });
    expect(updated.clientName).toBe("Client A modifié");
  });

  it("a valid admin session for a DIFFERENT tenant cannot delete tenant A's order", async () => {
    currentOrgId = TENANT_B;
    currentCookie = signAdminSession(TENANT_B);

    const res = await DELETE(
      new Request(`http://localhost/api/orders?id=${orderA.id}`, {
        method: "DELETE",
      }),
    );
    // Le where { id, tenantId } de la route ne trouve rien pour B : 404, pas
    // un vrai accès à la ligne de A.
    expect(res.status).toBe(404);

    const stillThere = await prisma.order.findUnique({
      where: { id: orderA.id },
    });
    expect(stillThere).not.toBeNull();
  });
});
