import { describe, it, expect, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  process.env.ADMIN_SESSION_SECRET = "test-secret";
});

describe("signAdminSession / verifyAdminSessionToken", () => {
  it("accepts a token signed for the same tenant", async () => {
    const { signAdminSession, verifyAdminSessionToken } = await import(
      "./adminSession"
    );
    const token = signAdminSession("tenant_a");
    expect(verifyAdminSessionToken(token, "tenant_a")).toBe(true);
  });

  it("rejects a token signed for a different tenant", async () => {
    const { signAdminSession, verifyAdminSessionToken } = await import(
      "./adminSession"
    );
    const token = signAdminSession("tenant_a");
    expect(verifyAdminSessionToken(token, "tenant_b")).toBe(false);
  });

  it("rejects a tampered token", async () => {
    const { signAdminSession, verifyAdminSessionToken } = await import(
      "./adminSession"
    );
    const token = signAdminSession("tenant_a");
    const [body] = token.split(".");
    const tampered = `${body}.deadbeef`;
    expect(verifyAdminSessionToken(tampered, "tenant_a")).toBe(false);
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    const { signAdminSession, verifyAdminSessionToken, ADMIN_SESSION_TTL_MS } =
      await import("./adminSession");
    const token = signAdminSession("tenant_a");
    vi.advanceTimersByTime(ADMIN_SESSION_TTL_MS + 1);
    expect(verifyAdminSessionToken(token, "tenant_a")).toBe(false);
    vi.useRealTimers();
  });

  it("rejects a PIN-reset token used as an admin-session token", async () => {
    const { signPinResetToken, verifyAdminSessionToken } = await import(
      "./adminSession"
    );
    const resetToken = signPinResetToken("tenant_a");
    expect(verifyAdminSessionToken(resetToken, "tenant_a")).toBe(false);
  });
});

describe("signPinResetToken / verifyPinResetToken", () => {
  it("accepts a token signed for the same tenant", async () => {
    const { signPinResetToken, verifyPinResetToken } = await import(
      "./adminSession"
    );
    const token = signPinResetToken("tenant_a");
    expect(verifyPinResetToken(token, "tenant_a")).toBe(true);
  });

  it("rejects an admin-session token used as a PIN-reset token", async () => {
    const { signAdminSession, verifyPinResetToken } = await import(
      "./adminSession"
    );
    const sessionToken = signAdminSession("tenant_a");
    expect(verifyPinResetToken(sessionToken, "tenant_a")).toBe(false);
  });
});
