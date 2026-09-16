import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { signAdminSession } from "@/lib/adminSession";

// Test d'intégration contre un vrai Postgres (docker-compose.yml) : /api/catalog
// n'avait aucun contrôle de rôle côté serveur avant le gate PIN
// (docs/adr/0003-compte-unique-pin-admin.md) — on vérifie ici à la fois que
// le gate PIN bloque bien un accès sans session admin valide, et que le
// scoping tenant réel empêche un tenant d'agir sur les données d'un autre,
// pour les trois types multiplexés par la route (category/subCategory/product).

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

import { POST, PUT, DELETE } from "./route";

const TENANT_A = "test_catalog_tenant_a";
const TENANT_B = "test_catalog_tenant_b";

let categoryA: { id: string };
let subCategoryA: { id: string };
let productA: { id: string };

async function wipeTestTenants() {
  await prisma.orderItem.deleteMany({
    where: { product: { tenantId: { in: [TENANT_A, TENANT_B] } } },
  });
  await prisma.product.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } });
  await prisma.subCategory.deleteMany({
    where: { category: { tenantId: { in: [TENANT_A, TENANT_B] } } },
  });
  await prisma.category.deleteMany({ where: { tenantId: { in: [TENANT_A, TENANT_B] } } });
  await prisma.tenant.deleteMany({ where: { id: { in: [TENANT_A, TENANT_B] } } });
}

beforeAll(async () => {
  await wipeTestTenants();

  await prisma.tenant.createMany({
    data: [
      { id: TENANT_A, name: "Tenant A (test catalog)", pinCodeHash: "x" },
      { id: TENANT_B, name: "Tenant B (test catalog)", pinCodeHash: "x" },
    ],
  });

  categoryA = await prisma.category.create({
    data: { name: "Entrées", tenantId: TENANT_A },
  });
  subCategoryA = await prisma.subCategory.create({
    data: { name: "Froides", categoryId: categoryA.id },
  });
  productA = await prisma.product.create({
    data: {
      designation: "Verrine",
      price: 5,
      tenantId: TENANT_A,
      categoryId: categoryA.id,
    },
  });
});

afterAll(async () => {
  await wipeTestTenants();
  await prisma.$disconnect();
});

function jsonRequest(method: string, body: unknown) {
  return new Request("http://localhost/api/catalog", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PIN gate on /api/catalog", () => {
  it("rejects POST without a valid admin session (403), nothing created", async () => {
    currentOrgId = TENANT_A;
    currentCookie = null;

    const before = await prisma.category.count({ where: { tenantId: TENANT_A } });
    const res = await POST(jsonRequest("POST", { type: "category", name: "Hacked" }));
    expect(res.status).toBe(403);

    const after = await prisma.category.count({ where: { tenantId: TENANT_A } });
    expect(after).toBe(before);
  });
});

describe("Tenant scoping on /api/catalog (real Postgres)", () => {
  it("a valid admin session for a DIFFERENT tenant cannot update tenant A's product", async () => {
    currentOrgId = TENANT_B;
    currentCookie = signAdminSession(TENANT_B);

    const res = await PUT(
      jsonRequest("PUT", { type: "product", id: productA.id, designation: "Volée" }),
    );
    // updateMany avec { id, tenantId: B } ne trouve rien pour le produit de A : 404.
    expect(res.status).toBe(404);

    const stillOriginal = await prisma.product.findUniqueOrThrow({
      where: { id: productA.id },
    });
    expect(stillOriginal.designation).toBe("Verrine");
  });

  it("a valid admin session for a DIFFERENT tenant cannot delete tenant A's subCategory", async () => {
    currentOrgId = TENANT_B;
    currentCookie = signAdminSession(TENANT_B);

    const res = await DELETE(
      new Request(`http://localhost/api/catalog?type=subCategory&id=${subCategoryA.id}`, {
        method: "DELETE",
      }),
    );
    expect(res.status).toBe(404);

    const stillThere = await prisma.subCategory.findUnique({
      where: { id: subCategoryA.id },
    });
    expect(stillThere).not.toBeNull();
  });

  it("the owning tenant can update its own product", async () => {
    currentOrgId = TENANT_A;
    currentCookie = signAdminSession(TENANT_A);

    const res = await PUT(
      jsonRequest("PUT", { type: "product", id: productA.id, designation: "Verrine modifiée" }),
    );
    expect(res.status).toBe(200);

    const updated = await prisma.product.findUniqueOrThrow({
      where: { id: productA.id },
    });
    expect(updated.designation).toBe("Verrine modifiée");
  });

  it("a valid admin session for a DIFFERENT tenant cannot delete tenant A's category", async () => {
    currentOrgId = TENANT_B;
    currentCookie = signAdminSession(TENANT_B);

    const res = await DELETE(
      new Request(`http://localhost/api/catalog?type=category&id=${categoryA.id}`, {
        method: "DELETE",
      }),
    );
    expect(res.status).toBe(404);

    const stillThere = await prisma.category.findUnique({
      where: { id: categoryA.id },
    });
    expect(stillThere).not.toBeNull();
  });

  it("scopes a new category to the caller's tenant", async () => {
    currentOrgId = TENANT_B;
    currentCookie = signAdminSession(TENANT_B);

    const res = await POST(jsonRequest("POST", { type: "category", name: "Desserts" }));
    expect(res.status).toBe(200);

    const created = await res.json();
    expect(created.tenantId).toBe(TENANT_B);
  });
});
