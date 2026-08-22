/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      organisationName,
      adminEmail,
      memberEmail,
      adminFirstName,
      adminLastName,
      memberFirstName,
      memberLastName,
      adminPassword,
      memberPassword,
    } = body;

    if (
      !organisationName ||
      !adminEmail ||
      !memberEmail ||
      !adminFirstName ||
      !adminLastName ||
      !memberFirstName ||
      !memberLastName ||
      !adminPassword ||
      !memberPassword
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (adminEmail.trim().toLowerCase() === memberEmail.trim().toLowerCase()) {
      return NextResponse.json(
        {
          error:
            "L'email admin et l'email membre doivent être différents.",
        },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // 2. Create Admin User
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
    let memberUser;
    try {
      // 3. Create Organization (Admin is creator)
      organization = await client.organizations.createOrganization({
        name: organisationName,
        createdBy: adminUser.id,
      });

      // 4. Create Member User
      memberUser = await client.users.createUser({
        emailAddress: [memberEmail],
        firstName: memberFirstName,
        lastName: memberLastName,
        password: memberPassword,
        skipPasswordChecks: false,
        skipPasswordRequirement: false,
      });

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
    } catch (e: any) {
      console.error("Error in create-organization (post-admin steps):", e);

      // Best-effort cleanup of whatever was created before the failure.
      // Deleting the organization also removes its memberships; the admin
      // user is deleted separately since it was created before this block.
      await Promise.allSettled([
        organization
          ? client.organizations.deleteOrganization(organization.id)
          : Promise.resolve(),
        memberUser ? client.users.deleteUser(memberUser.id) : Promise.resolve(),
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

    // 6. Send Emails
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.batch.send([
          {
            from: "Cet Extra <no-reply@cetextra.fr>",
            to: adminEmail,
            subject: "Bienvenue sur Cahier du Chef",
            react: WelcomeEmail({
              email: adminEmail,
              role: "Admin",
            }),
          },
          {
            from: "Cet Extra <no-reply@cetextra.fr>",
            to: memberEmail,
            subject: "Bienvenue sur Cahier du Chef",
            react: WelcomeEmail({
              email: memberEmail,
              role: "Membre",
            }),
          },
        ]);
      } catch (error) {
        console.error("Error sending emails:", error);
      }
    } else {
      console.log("RESEND_API_KEY not configured. Skipping welcome emails.");
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
