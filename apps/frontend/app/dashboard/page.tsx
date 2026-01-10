import { currentUser } from "@clerk/nextjs/server";
import HomeHeader from "@/components/layout/home-header";
import HomeFooter from "@/components/layout/home-footer";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex flex-col gap-4">
          <Badge className="w-fit" variant="secondary">User Dashboard</Badge>
          <h1 className="text-4xl font-bold font-heading tracking-tight">
            Welcome back, <span className="text-primary">{user?.firstName || "Wizard"}</span> ✨
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            This is your private dashboard where you can manage your components, view your sales, and explore the marketplace.
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold font-heading mb-2">My Components</h2>
            <p className="text-sm text-muted-foreground mb-4">You haven't uploaded any components yet.</p>
            <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
              <div className="h-full bg-primary w-0" />
            </div>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold font-heading mb-2">Sales</h2>
            <p className="text-sm text-muted-foreground mb-4">Total revenue: $0.00</p>
            <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-0" />
            </div>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur">
            <h2 className="text-lg font-semibold font-heading mb-2">Market Progress</h2>
            <p className="text-sm text-muted-foreground mb-4">Top 100% of creators.</p>
            <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
               <div className="h-full bg-primary/40 w-full" />
            </div>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
