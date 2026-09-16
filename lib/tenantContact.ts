import { clerkClient } from "@clerk/nextjs/server";

/** Adresse email de l'unique compte Clerk du tenant (ou null si introuvable). */
export async function getTenantAdminEmail(orgId: string): Promise<string | null> {
  const client = await clerkClient();
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  return memberships.data[0]?.publicUserData?.identifier ?? null;
}
