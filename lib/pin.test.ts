import { describe, it, expect } from "vitest";
import { hashPin, verifyPin, computeLockoutMs } from "./pin";

describe("hashPin / verifyPin", () => {
  it("verifies a correct PIN against its hash", () => {
    const hash = hashPin("123456");
    expect(verifyPin("123456", hash)).toBe(true);
  });

  it("rejects an incorrect PIN", () => {
    const hash = hashPin("123456");
    expect(verifyPin("000000", hash)).toBe(false);
  });

  it("produces a different hash each time (random salt)", () => {
    const a = hashPin("123456");
    const b = hashPin("123456");
    expect(a).not.toBe(b);
    expect(verifyPin("123456", a)).toBe(true);
    expect(verifyPin("123456", b)).toBe(true);
  });

  it("rejects a malformed stored hash instead of throwing", () => {
    expect(verifyPin("123456", "not-a-valid-hash")).toBe(false);
  });
});

describe("computeLockoutMs", () => {
  it("returns 0 for level 0 (no lockout yet)", () => {
    expect(computeLockoutMs(0)).toBe(0);
  });

  it("doubles the duration at each level", () => {
    expect(computeLockoutMs(1)).toBe(60_000);
    expect(computeLockoutMs(2)).toBe(120_000);
    expect(computeLockoutMs(3)).toBe(240_000);
    expect(computeLockoutMs(4)).toBe(480_000);
  });

  it("caps at 15 minutes", () => {
    expect(computeLockoutMs(5)).toBe(15 * 60_000);
    expect(computeLockoutMs(10)).toBe(15 * 60_000);
  });
});
