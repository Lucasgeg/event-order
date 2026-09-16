/*
  Warnings:

  - You are about to drop the `TenantMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pinCodeHash` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TenantMember" DROP CONSTRAINT "TenantMember_tenantId_fkey";

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "pinCodeHash" TEXT NOT NULL,
ADD COLUMN     "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3),
ADD COLUMN     "pinLockoutLevel" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "TenantMember";

-- DropEnum
DROP TYPE "TenantRole";
