/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/pin";

const resend = new Resend(process.env.RESEND_API_KEY);
const PIN_PATTERN = /^\d{6}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organisationName,
      adminEmail,
      adminFirstName,
      adminLastName,
      adminPassword,
      pinCode,
    } = body;

    if (
      !organisationName ||
      !adminEmail ||
      !adminFirstName ||
      !adminLastName ||
      !adminPassword ||
      !pinCode
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!PIN_PATTERN.test(pinCode)) {
      return NextResponse.json(
        { error: "Le code PIN doit comporter 6 chiffres." },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // 2. Create Admin User (l'unique compte du tenant)
    let adminUser;
    try {
      adminUser = await client.users.createUser({
        emailAddress: [adminEmail],
        firstName: adminFirstName,
        lastName: adminLastName,
        password: adminPassword,
        skipPasswordChecks: false,
        skipPasswordRequirement: false,
      });
    } catch (e: any) {
      // If the user already exists, we return an error rather than trying to
      // reuse/reset their account — this endpoint only creates new users.
      return NextResponse.json(
        { error: `Error creating admin user: ${e.message}` },
        { status: 400 }
      );
    }

    // From this point on, the admin Clerk user exists: any failure below must
    // roll back everything created so far before returning an error, or we
    // leave orphaned Clerk resources with no matching Tenant in DB.
    let organization;
    try {
      // 3. Create Organization (Admin is creator)
      organization = await client.organizations.createOrganization({
        name: organisationName,
        createdBy: adminUser.id,
      });

      // Create Tenant
      await prisma.tenant.create({
        data: {
          id: organization.id,
          name: organisationName,
          pinCodeHash: hashPin(pinCode),
        },
      });
    } catch (e: any) {
      console.error("Error in create-organization (post-admin steps):", e);

      // Best-effort cleanup of whatever was created before the failure.
      await Promise.allSettled([
        organization
          ? client.organizations.deleteOrganization(organization.id)
          : Promise.resolve(),
        client.users.deleteUser(adminUser.id),
      ]).then((results) => {
        for (const result of results) {
          if (result.status === "rejected") {
            console.error("Cleanup failed after signup error:", result.reason);
          }
        }
      });

      return NextResponse.json(
        { error: `Error creating organization: ${e.message}` },
        { status: 400 }
      );
    }

    // 6. Send Email
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "Cet Extra <no-reply@cetextra.fr>",
          to: adminEmail,
          subject: "Bienvenue sur Cahier du Chef",
          react: WelcomeEmail({
            email: adminEmail,
            role: "Admin",
          }),
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }
    } else {
      console.log("RESEND_API_KEY not configured. Skipping welcome email.");
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
      },
      user: { id: adminUser.id, email: adminEmail },
      message: "Organization and user created. Email sent (or logged).",
    });
  } catch (error: any) {
    console.error("Error in create-organization:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
