import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { signPinResetToken } from "@/lib/adminSession";
import { getTenantAdminEmail } from "@/lib/tenantContact";
import { PinResetEmail } from "@/emails/PinResetEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: orgId },
      select: { name: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant introuvable" }, { status: 404 });
    }

    const adminEmail = await getTenantAdminEmail(orgId);
    if (!adminEmail) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }

    const token = signPinResetToken(orgId);
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const resetUrl = `${origin}/reinitialiser-pin?token=${encodeURIComponent(token)}`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Cet Extra <no-reply@cetextra.fr>",
        to: adminEmail,
        subject: "Réinitialisation du code PIN — Cahier du Chef",
        react: PinResetEmail({ organisationName: tenant.name, resetUrl }),
      });
    } else {
      console.log(`[PIN reset] Lien pour ${adminEmail}: ${resetUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting PIN reset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
