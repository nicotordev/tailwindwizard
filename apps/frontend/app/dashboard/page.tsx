import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { serializeClerkUser } from "@/utils/serialization";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = user.publicMetadata?.role as string | undefined;
  const isCreator = !!user.publicMetadata?.isCreator;

  if (role === "ADMIN") {
    redirect("/admin");
  }

  const serializedUser = serializeClerkUser(user);

  if (!serializedUser) {
    redirect("/sign-in");
  }

  return <DashboardShell user={serializedUser} isCreator={isCreator} />;
}
