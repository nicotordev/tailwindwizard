import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/primitives/empty-state"
import { PushCta } from "@/components/notifications/push-cta"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Notifications</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Updates & alerts
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Stay on top of purchases, approvals, and new marketplace activity.
        </p>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-xl font-heading">Push notifications</CardTitle>
          <CardDescription>
            Enable browser notifications for real-time updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PushCta />
        </CardContent>
      </Card>

      <EmptyState
        title="No notifications yet"
        description="You will see purchase and approval updates here once they arrive."
        icon={Bell}
        variant="hero"
      />
    </div>
  )
}
