import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isCreator = !!user.publicMetadata?.isCreator;

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <DashboardSidebar isCreator={isCreator} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8">
          <div className="w-full first:w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
