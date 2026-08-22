import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgRole } = await auth();

  if (!userId) redirect("/login");
  if (orgRole !== "org:admin") redirect("/user");

  return <>{children}</>;
}
