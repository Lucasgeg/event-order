import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { signAdminSession } from "@/lib/adminSession";

// Test d'intégration contre un vrai Postgres (docker-compose.yml) : le
// figeage de unitPrice/designation à la création puis à l'édition d'une
// commande (app/api/orders/route.ts) est signalé dans TODO.md comme non
// couvert. On vérifie ici que le prix catalogue change n'affecte ni les
// lignes déjà créées (POST) ni les lignes ré-envoyées avec leur id d'origine
// (PUT), mais s'applique bien aux lignes nouvellement ajoutées.

const TENANT = "test_freezing_tenant";

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

import { POST, PUT } from "./route";

let categoryId: string;
let productId: string;
let secondProductId: string;

async function wipeTestTenant() {
  await prisma.order.deleteMany({ where: { tenantId: TENANT } });
  await prisma.product.deleteMany({ where: { tenantId: TENANT } });
  await prisma.category.deleteMany({ where: { tenantId: TENANT } });
  await prisma.tenant.deleteMany({ where: { id: TENANT } });
}

beforeAll(async () => {
  await wipeTestTenant();

  await prisma.tenant.create({
    data: { id: TENANT, name: "Tenant figeage (test)", pinCodeHash: "x" },
  });

  const category = await prisma.category.create({
    data: { name: "Plats", tenantId: TENANT },
  });
  categoryId = category.id;

  const product = await prisma.product.create({
    data: { designation: "Poulet rôti", price: 12, tenantId: TENANT, categoryId },
  });
  productId = product.id;

  const secondProduct = await prisma.product.create({
    data: { designation: "Salade", price: 4, tenantId: TENANT, categoryId },
  });
  secondProductId = secondProduct.id;
});

beforeEach(async () => {
  currentOrgId = TENANT;
  currentCookie = signAdminSession(TENANT);
  // Remet le prix catalogue à sa valeur de départ avant chaque test.
  await prisma.product.update({ where: { id: productId }, data: { price: 12, designation: "Poulet rôti" } });
});

afterAll(async () => {
  await wipeTestTenant();
  await prisma.$disconnect();
});

function postRequest(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function putRequest(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Order item price/designation freezing (real Postgres)", () => {
  it("freezes the catalog price and designation at creation time", async () => {
    const res = await POST(
      postRequest({
        clientName: "Client freeze",
        pickupDate: new Date().toISOString(),
        items: [{ productId, quantity: 2 }],
      }),
    );
    expect(res.status).toBe(200);
    const order = await res.json();
    expect(order.items).toHaveLength(1);
    expect(order.items[0].unitPrice).toBe(12);
    expect(order.items[0].designation).toBe("Poulet rôti");
  });

  it("keeps the frozen price/designation on an existing line even after the catalog price changes", async () => {
    const created = await POST(
      postRequest({
        clientName: "Client garde figé",
        pickupDate: new Date().toISOString(),
        items: [{ productId, quantity: 1 }],
      }),
    ).then((r) => r.json());
    const originalItemId = created.items[0].id;

    // Le prix catalogue change après la création de la commande.
    await prisma.product.update({ where: { id: productId }, data: { price: 25, designation: "Poulet rôti fermier" } });

    const updated = await PUT(
      putRequest({
        id: created.id,
        items: [{ id: originalItemId, productId, quantity: 3 }],
      }),
    ).then((r) => r.json());

    expect(updated.items[0].quantity).toBe(3);
    expect(updated.items[0].unitPrice).toBe(12);
    expect(updated.items[0].designation).toBe("Poulet rôti");
  });

  it("uses the current catalog price/designation for a newly added line (no id)", async () => {
    const created = await POST(
      postRequest({
        clientName: "Client ajout ligne",
        pickupDate: new Date().toISOString(),
        items: [{ productId, quantity: 1 }],
      }),
    ).then((r) => r.json());
    const originalItemId = created.items[0].id;

    const updated = await PUT(
      putRequest({
        id: created.id,
        items: [
          { id: originalItemId, productId, quantity: 1 },
          { productId: secondProductId, quantity: 2 },
        ],
      }),
    ).then((r) => r.json());

    const newLine = updated.items.find((i: { productId: string }) => i.productId === secondProductId);
    expect(newLine.unitPrice).toBe(4);
    expect(newLine.designation).toBe("Salade");
  });

  it("uses the current price when an item's id is re-sent with a different productId", async () => {
    const created = await POST(
      postRequest({
        clientName: "Client produit changé",
        pickupDate: new Date().toISOString(),
        items: [{ productId, quantity: 1 }],
      }),
    ).then((r) => r.json());
    const originalItemId = created.items[0].id;

    const updated = await PUT(
      putRequest({
        id: created.id,
        items: [{ id: originalItemId, productId: secondProductId, quantity: 1 }],
      }),
    ).then((r) => r.json());

    expect(updated.items[0].productId).toBe(secondProductId);
    expect(updated.items[0].unitPrice).toBe(4);
    expect(updated.items[0].designation).toBe("Salade");
  });
});
