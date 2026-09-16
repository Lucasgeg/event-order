import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@/generated/prisma/client";

vi.mock("@/lib/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  return { prisma: mockDeep<PrismaClient>() };
});

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(async () => ({ orgId: "tenant_a" })),
}));

vi.mock("@/lib/tenantContact", () => ({
  getTenantAdminEmail: vi.fn(async () => "admin@example.com"),
}));

// Le contenu de l'email de verrouillage n'est pas testé ici (fire-and-forget,
// hors chemin critique) — juste un double inerte pour éviter un vrai appel réseau.
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: async () => ({ data: {}, error: null }) };
  },
}));

import { POST } from "./route";
import { hashPin } from "@/lib/pin";
import { prisma } from "@/lib/prisma";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

function makeRequest(pin: unknown) {
  return new Request("http://localhost/api/admin-session", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

function baseTenant(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: "Ete test",
    pinCodeHash: hashPin("123456"),
    pinFailedAttempts: 0,
    pinLockedUntil: null,
    pinLockoutLevel: 0,
    ...overrides,
  };
}

beforeEach(() => {
  mockReset(prismaMock);
  process.env.ADMIN_SESSION_SECRET = "test-secret";
  delete process.env.RESEND_API_KEY;
});

describe("POST /api/admin-session", () => {
  it("sets the admin-session cookie and resets counters on a correct PIN", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(
      baseTenant({ pinFailedAttempts: 2 }) as never,
    );

    const res = await POST(makeRequest("123456"));

    expect(res.status).toBe(200);
    expect(prismaMock.tenant.update).toHaveBeenCalledWith({
      where: { id: "tenant_a" },
      data: { pinFailedAttempts: 0, pinLockedUntil: null, pinLockoutLevel: 0 },
    });
    expect(res.cookies.get("admin_session")?.value).toBeTruthy();
  });

  it("increments the failure counter on a wrong PIN without locking", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(
      baseTenant({ pinFailedAttempts: 1 }) as never,
    );

    const res = await POST(makeRequest("000000"));

    expect(res.status).toBe(403);
    expect(prismaMock.tenant.update).toHaveBeenCalledWith({
      where: { id: "tenant_a" },
      data: { pinFailedAttempts: 2 },
    });
  });

  it("locks out and computes the lockout duration on the 5th consecutive failure", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(
      baseTenant({ pinFailedAttempts: 4, pinLockoutLevel: 0 }) as never,
    );

    const res = await POST(makeRequest("000000"));

    expect(res.status).toBe(429);
    expect(prismaMock.tenant.update).toHaveBeenCalledTimes(1);

    const [call] = prismaMock.tenant.update.mock.calls[0];
    expect(call.where).toEqual({ id: "tenant_a" });
    expect(call.data).toMatchObject({ pinFailedAttempts: 0, pinLockoutLevel: 1 });
    expect((call.data as { pinLockedUntil: Date }).pinLockedUntil).toBeInstanceOf(
      Date,
    );
  });

  it("doubles the lockout duration on a second consecutive lockout episode", async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(
      baseTenant({ pinFailedAttempts: 4, pinLockoutLevel: 1 }) as never,
    );

    const before = Date.now();
    const res = await POST(makeRequest("000000"));
    expect(res.status).toBe(429);

    const [call] = prismaMock.tenant.update.mock.calls[0];
    const data = call.data as { pinLockedUntil: Date; pinLockoutLevel: number };
    expect(data.pinLockoutLevel).toBe(2);
    // Niveau 2 -> 2 minutes de verrouillage.
    expect(data.pinLockedUntil.getTime() - before).toBeGreaterThanOrEqual(
      2 * 60_000 - 1000,
    );
  });

  it("rejects immediately while already locked out, without touching the counters", async () => {
    const future = new Date(Date.now() + 60_000);
    prismaMock.tenant.findUnique.mockResolvedValue(
      baseTenant({ pinLockedUntil: future, pinLockoutLevel: 1 }) as never,
    );

    const res = await POST(makeRequest("123456"));

    expect(res.status).toBe(429);
    expect(prismaMock.tenant.update).not.toHaveBeenCalled();
  });

  it("rejects a malformed PIN before touching the database", async () => {
    const res = await POST(makeRequest("12"));

    expect(res.status).toBe(400);
    expect(prismaMock.tenant.findUnique).not.toHaveBeenCalled();
  });
});
