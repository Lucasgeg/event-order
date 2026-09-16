import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { hashPin, verifyPin, computeLockoutMs } from "@/lib/pin";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  requireAdminSession,
  signAdminSession,
} from "@/lib/adminSession";
import { getTenantAdminEmail } from "@/lib/tenantContact";
import { PinLockoutEmail } from "@/emails/PinLockoutEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;
const PIN_PATTERN = /^\d{6}$/;

function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "inconnue";
}

function sendLockoutEmail(params: {
  orgId: string;
  organisationName: string;
  lockedUntil: Date;
  ipAddress: string;
}) {
  // Fire-and-forget : ne doit jamais retarder la réponse au client.
  (async () => {
    const adminEmail = await getTenantAdminEmail(params.orgId);
    if (!adminEmail) return;

    if (!process.env.RESEND_API_KEY) {
      console.log(
        `[PIN lockout] ${params.organisationName} verrouillé jusqu'à ${params.lockedUntil.toISOString()} (IP: ${params.ipAddress}) — RESEND_API_KEY absent, email non envoyé.`,
      );
      return;
    }

    await resend.emails.send({
      from: "Cet Extra <no-reply@cetextra.fr>",
      to: adminEmail,
      subject: "Accès admin verrouillé — Cahier du Chef",
      react: PinLockoutEmail({
        organisationName: params.organisationName,
        lockedUntil: params.lockedUntil,
        ipAddress: params.ipAddress,
      }),
    });
  })().catch((error) => {
    console.error("Error sending PIN lockout email:", error);
  });
}

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pin } = await request.json();
    if (typeof pin !== "string" || !PIN_PATTERN.test(pin)) {
      return NextResponse.json({ error: "Code PIN invalide" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        pinCodeHash: true,
        pinFailedAttempts: true,
        pinLockedUntil: true,
        pinLockoutLevel: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant introuvable" }, { status: 404 });
    }

    if (tenant.pinLockedUntil && tenant.pinLockedUntil > new Date()) {
      return NextResponse.json(
        {
          error: "Accès verrouillé suite à plusieurs échecs",
          lockedUntil: tenant.pinLockedUntil,
        },
        { status: 429 },
      );
    }

    if (verifyPin(pin, tenant.pinCodeHash)) {
      await prisma.tenant.update({
        where: { id: orgId },
        data: { pinFailedAttempts: 0, pinLockedUntil: null, pinLockoutLevel: 0 },
      });

      const response = NextResponse.json({ success: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, signAdminSession(orgId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ADMIN_SESSION_TTL_MS / 1000,
      });
      return response;
    }

    const newAttempts = tenant.pinFailedAttempts + 1;

    if (newAttempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
      const newLevel = tenant.pinLockoutLevel + 1;
      const lockedUntil = new Date(Date.now() + computeLockoutMs(newLevel));

      await prisma.tenant.update({
        where: { id: orgId },
        data: {
          pinFailedAttempts: 0,
          pinLockedUntil: lockedUntil,
          pinLockoutLevel: newLevel,
        },
      });

      sendLockoutEmail({
        orgId,
        organisationName: tenant.name,
        lockedUntil,
        ipAddress: getRequestIp(request),
      });

      return NextResponse.json(
        { error: "Trop d'échecs, accès verrouillé", lockedUntil },
        { status: 429 },
      );
    }

    await prisma.tenant.update({
      where: { id: orgId },
      data: { pinFailedAttempts: newAttempts },
    });

    return NextResponse.json(
      {
        error: "Code PIN incorrect",
        attemptsRemaining: MAX_ATTEMPTS_BEFORE_LOCKOUT - newAttempts,
      },
      { status: 403 },
    );
  } catch (error) {
    console.error("Error verifying admin PIN:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession();
    if (session instanceof NextResponse) return session;
    const { orgId } = session;

    const { currentPin, newPin } = await request.json();
    if (typeof currentPin !== "string" || typeof newPin !== "string") {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (!PIN_PATTERN.test(newPin)) {
      return NextResponse.json(
        { error: "Le nouveau code PIN doit comporter 6 chiffres" },
        { status: 400 },
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: orgId },
      select: { pinCodeHash: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant introuvable" }, { status: 404 });
    }

    if (!verifyPin(currentPin, tenant.pinCodeHash)) {
      return NextResponse.json({ error: "Code PIN actuel incorrect" }, { status: 403 });
    }

    await prisma.tenant.update({
      where: { id: orgId },
      data: {
        pinCodeHash: hashPin(newPin),
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        pinLockoutLevel: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing admin PIN:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  const { orgId } = await auth();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
