import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_MS = 15 * 60_000;
const PIN_RESET_TOKEN_TTL_MS = 15 * 60_000;

function requireSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  return secret;
}

interface TokenPayload {
  purpose: "admin-session" | "pin-reset";
  tenantId: string;
  issuedAt: number;
}

function sign(payload: TokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", requireSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): TokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expectedSig = createHmac("sha256", requireSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }
}

export function signAdminSession(tenantId: string): string {
  return sign({ purpose: "admin-session", tenantId, issuedAt: Date.now() });
}

export function verifyAdminSessionToken(token: string, tenantId: string): boolean {
  const payload = verify(token);
  if (!payload || payload.purpose !== "admin-session") return false;
  if (payload.tenantId !== tenantId) return false;
  return Date.now() - payload.issuedAt < ADMIN_SESSION_TTL_MS;
}

export function signPinResetToken(tenantId: string): string {
  return sign({ purpose: "pin-reset", tenantId, issuedAt: Date.now() });
}

export function verifyPinResetToken(token: string, tenantId: string): boolean {
  const payload = verify(token);
  if (!payload || payload.purpose !== "pin-reset") return false;
  if (payload.tenantId !== tenantId) return false;
  return Date.now() - payload.issuedAt < PIN_RESET_TOKEN_TTL_MS;
}

/** Pour les Server Components (ex: admin/layout.tsx) qui décident quoi rendre. */
export async function hasValidAdminSession(tenantId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return !!token && verifyAdminSessionToken(token, tenantId);
}

/**
 * Remplace les checks `orgRole !== "org:admin"` dans les routes API. Retourne
 * `{ orgId }` si la session admin (PIN) est valide, sinon une NextResponse
 * 401/403 prête à `return`.
 */
export async function requireAdminSession(): Promise<
  { orgId: string } | NextResponse
> {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasValidAdminSession(orgId))) {
    return NextResponse.json(
      { error: "Réservé à l'espace admin (PIN requis)" },
      { status: 403 },
    );
  }

  return { orgId };
}
