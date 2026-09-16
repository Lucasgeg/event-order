import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/adminSession";
import { PinGate } from "@/app/components/PinGate";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) redirect("/login");

  // Plus de second rôle Clerk : l'accès au panneau admin est protégé par un
  // code PIN, redemandé à chaque entrée (docs/adr/0003-compte-unique-pin-admin.md).
  if (!(await hasValidAdminSession(orgId))) {
    return <PinGate />;
  }

  return <>{children}</>;
}
