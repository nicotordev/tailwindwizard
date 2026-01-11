import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { serializeClerkUser } from "@/utils/serialization";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = user.publicMetadata?.role as string | undefined;
  const isCreator = !!user.publicMetadata?.isCreator;
  const userId = user.id;
  const isAdmin = role === "ADMIN";
  const couldBeAdmin = process.env.ADMIN_EMAILS?.split(",").includes(
    user.emailAddresses[0].emailAddress
  );

  if (couldBeAdmin && !isAdmin) {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    });
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "ADMIN" },
    });
  }
  
  const serializedUser = serializeClerkUser(user);

  if (!serializedUser) {
    redirect("/sign-in");
  }

  return <DashboardShell user={serializedUser} isCreator={isCreator} />;
}
