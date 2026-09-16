import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/pin";
import { verifyPinResetToken } from "@/lib/adminSession";

const PIN_PATTERN = /^\d{6}$/;

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, newPin } = await request.json();
    if (typeof token !== "string" || typeof newPin !== "string") {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (!PIN_PATTERN.test(newPin)) {
      return NextResponse.json(
        { error: "Le nouveau code PIN doit comporter 6 chiffres" },
        { status: 400 },
      );
    }

    if (!verifyPinResetToken(token, orgId)) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré" },
        { status: 403 },
      );
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
    console.error("Error resetting admin PIN:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
