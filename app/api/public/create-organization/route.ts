/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to generate a strong password
function generatePassword(length = 16) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  // Ensure at least one of each type
  if (!/[a-z]/.test(password)) password += "a";
  if (!/[A-Z]/.test(password)) password += "A";
  if (!/[0-9]/.test(password)) password += "1";
  if (!/[^a-zA-Z0-9]/.test(password)) password += "!";
  return password;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organisationName, adminEmail, memberEmail } = body;

    if (!organisationName || !adminEmail || !memberEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // 1. Generate passwords
    const adminPassword = generatePassword();
    const memberPassword = generatePassword();

    // 2. Create Admin User
    let adminUser;
    try {
      adminUser = await client.users.createUser({
        emailAddress: [adminEmail],
        password: adminPassword,
        skipPasswordChecks: false,
        skipPasswordRequirement: false,
      });
    } catch (e: any) {
      // If user already exists, we might want to find them, but for this specific requirement
      // of generating a password and sending it, it implies new users.
      // We'll return an error if they exist.
      return NextResponse.json(
        { error: `Error creating admin user: ${e.message}` },
        { status: 400 }
      );
    }

    // 3. Create Organization (Admin is creator)
    const organization = await client.organizations.createOrganization({
      name: organisationName,
      createdBy: adminUser.id,
    });

    // 4. Create Member User
    let memberUser;
    try {
      memberUser = await client.users.createUser({
        emailAddress: [memberEmail],
        password: memberPassword,
        skipPasswordChecks: false,
        skipPasswordRequirement: false,
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: `Error creating member user: ${e.message}` },
        { status: 400 }
      );
    }

    // 5. Add Member to Organization
    await client.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: memberUser.id,
      role: "org:member",
    });

    // Create Tenant and Members in DB
    await prisma.tenant.create({
      data: {
        id: organization.id,
        name: organisationName,
        members: {
          create: [
            {
              userId: adminUser.id,
              role: "ADMIN",
            },
            {
              userId: memberUser.id,
              role: "USER",
            },
          ],
        },
      },
    });

    await client.users.setPasswordCompromised(memberUser.id);
    await client.users.setPasswordCompromised(adminUser.id);

    // 6. Send Emails
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.batch.send([
          {
            from: "Cet Extra <no-reply@cetextra.fr>",
            to: adminEmail,
            subject: "Bienvenue sur Event Order",
            react: WelcomeEmail({
              email: adminEmail,
              password: adminPassword,
              role: "Admin",
            }),
          },
          {
            from: "Cet Extra <no-reply@cetextra.fr>",
            to: memberEmail,
            subject: "Bienvenue sur Event Order",
            react: WelcomeEmail({
              email: memberEmail,
              password: memberPassword,
              role: "Membre",
            }),
          },
        ]);
      } catch (error) {
        console.error("Error sending emails:", error);
      }
    } else {
      console.log("RESEND_API_KEY not configured. Logging credentials:");
      console.log(`To Admin: ${adminEmail} / ${adminPassword}`);
      console.log(`To Member: ${memberEmail} / ${memberPassword}`);
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
      },
      users: {
        admin: { id: adminUser.id, email: adminEmail },
        member: { id: memberUser.id, email: memberEmail },
      },
      message: "Organization and users created. Emails sent (or logged).",
    });
  } catch (error: any) {
    console.error("Error in create-organization:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
