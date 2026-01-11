import { apiClient } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gavel, ShieldCheck, Users, Wallet } from "lucide-react"

export default async function AdminPage() {
  const { data: moderationQueue } = await apiClient.GET("/api/v1/admin/moderation", {
    cache: "no-store",
  })

  const pendingCount = moderationQueue?.meta.total ?? 0

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Admin Console</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Operations overview
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Monitor marketplace health, approvals, and revenue signals.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gavel}
          label="Pending reviews"
          value={pendingCount.toString()}
        />
        <StatCard icon={ShieldCheck} label="Policy checks" value="Stable" />
        <StatCard icon={Users} label="Creators" value="-" />
        <StatCard icon={Wallet} label="Revenue" value="-" />
      </div>

      <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-xl font-heading">What needs attention</CardTitle>
          <CardDescription>
            Keep the moderation queue moving and spot creator issues early.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Review {pendingCount} blocks waiting for moderation. Creator and finance
          dashboards will surface additional alerts once the admin APIs are wired.
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gavel
  label: string
  value: string
}) {
  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {label}
          </CardTitle>
          <CardDescription className="text-2xl font-heading text-foreground mt-2">
            {value}
          </CardDescription>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardHeader>
    </Card>
  )
}
