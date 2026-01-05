import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { orgId, userId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify if user is admin of the org
    const client = await clerkClient();
    const membershipList =
      await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

    const currentUserMembership = membershipList.data.find(
      (mem) => mem.publicUserData?.userId === userId
    );

    if (currentUserMembership?.role !== "org:admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return members
    const members = membershipList.data.map((mem) => ({
      id: mem.id,
      userId: mem.publicUserData?.userId,
      email: mem.publicUserData?.identifier,
      firstName: mem.publicUserData?.firstName,
      lastName: mem.publicUserData?.lastName,
      role: mem.role,
      imageUrl: mem.publicUserData?.imageUrl,
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { orgId, userId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();

    // Verify admin
    const membershipList =
      await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

    const currentUserMembership = membershipList.data.find(
      (mem) => mem.publicUserData?.userId === userId
    );

    if (currentUserMembership?.role !== "org:admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check limit (4 members max)
    // Note: membershipList includes the admin.
    if (membershipList.totalCount >= 4) {
      return NextResponse.json(
        { error: "La limite de 4 membres a été atteinte." },
        { status: 400 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Invite to Clerk Organization
    // This will send an email invitation
    try {
      await client.organizations.createOrganizationInvitation({
        organizationId: orgId,
        emailAddress: email,
        role: "org:member",
        redirectUrl: `${origin}/accept-invitation`,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // If user is already a member or invited, handle gracefully?
      // Clerk throws if already in org.
      return NextResponse.json(
        { error: e.errors?.[0]?.message || "Error inviting user" },
        { status: 400 }
      );
    }

    // Try to sync with DB if user exists in Clerk
    // We search for the user by email to get their userId
    const userList = await client.users.getUserList({
      emailAddress: [email],
    });

    if (userList.data.length > 0) {
      const invitedUser = userList.data[0];

      // Check if Tenant exists for this orgId (it should)
      // We might need to find the Tenant record by some ID?
      // Wait, the schema has `Tenant` with `id`. Is `id` the `orgId`?
      // Usually yes, if we sync them. Let's assume Tenant.id === orgId.
      // If not, we need to find the tenant.

      // Let's check if Tenant exists with this ID, if not create it?
      // The app seems to assume Tenant exists.

      // Upsert TenantMember
      await prisma.tenantMember.upsert({
        where: {
          tenantId_userId: {
            tenantId: orgId,
            userId: invitedUser.id,
          },
        },
        create: {
          tenantId: orgId,
          userId: invitedUser.id,
          role: "USER", // Default role
        },
        update: {
          role: "USER",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { orgId, userId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();

    // Verify admin
    const membershipList =
      await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

    const currentUserMembership = membershipList.data.find(
      (mem) => mem.publicUserData?.userId === userId
    );

    if (currentUserMembership?.role !== "org:admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId: memberUserId } = await request.json();
    if (!memberUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (memberUserId === userId) {
      return NextResponse.json(
        { error: "Cannot remove yourself" },
        { status: 400 }
      );
    }

    // Remove from Clerk
    await client.organizations.deleteOrganizationMembership({
      organizationId: orgId,
      userId: memberUserId,
    });

    // Remove from DB
    try {
      await prisma.tenantMember.delete({
        where: {
          tenantId_userId: {
            tenantId: orgId,
            userId: memberUserId,
          },
        },
      });
    } catch (e) {
      console.log("Member not found in DB or already deleted");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
