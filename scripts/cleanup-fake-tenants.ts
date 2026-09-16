/**
 * Nettoyage one-shot des tenants factices créés avant le passage au modèle
 * "compte unique par tenant + PIN admin" (docs/adr/0003-compte-unique-pin-admin.md).
 *
 * L'app n'est pas encore ouverte au public : les tenants existants n'ont pas
 * de PIN et ne méritent pas de migration prudente. Ce script les supprime
 * purement et simplement (Clerk + DB) avant que la migration Prisma
 * n'ajoute la colonne `pinCodeHash` (non-nullable) sur `Tenant`.
 *
 * À exécuter manuellement une fois, avant `bunx prisma migrate dev` :
 *   bun scripts/cleanup-fake-tenants.ts
 */
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });

  if (tenants.length === 0) {
    console.log("Aucun tenant à nettoyer.");
    return;
  }

  console.log(`Suppression de ${tenants.length} tenant(s) factice(s)...`);

  const client = await clerkClient();

  for (const tenant of tenants) {
    console.log(`- ${tenant.name} (${tenant.id})`);

    try {
      const memberships = await client.organizations.getOrganizationMembershipList({
        organizationId: tenant.id,
      });

      for (const membership of memberships.data) {
        const userId = membership.publicUserData?.userId;
        if (userId) {
          await client.users.deleteUser(userId).catch((e) => {
            console.error(`  Échec suppression user Clerk ${userId}:`, e);
          });
        }
      }

      await client.organizations.deleteOrganization(tenant.id).catch((e) => {
        console.error(`  Échec suppression org Clerk ${tenant.id}:`, e);
      });
    } catch (e) {
      console.error(`  Échec nettoyage Clerk pour ${tenant.id}:`, e);
    }

    // Ordre imposé par les contraintes de clé étrangère (Restrict par défaut
    // sur Product -> Category/SubCategory et OrderItem -> Product, cf.
    // prisma/seed.ts) : commandes avant produits, produits avant
    // (sous-)catégories, puis le tenant lui-même.
    await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.subCategory.deleteMany({
      where: { category: { tenantId: tenant.id } },
    });
    await prisma.category.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
  }

  console.log("Nettoyage terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
