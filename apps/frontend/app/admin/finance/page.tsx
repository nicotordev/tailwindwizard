import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Receipt } from "lucide-react"

export default function AdminFinancePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Finance</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Finance dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Monitor purchases, disputes, and webhook health across the marketplace.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading">Purchases</CardTitle>
              <CardDescription>Global order feed</CardDescription>
            </div>
            <Receipt className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Connect admin commerce endpoints to stream marketplace purchases.
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading">Webhook health</CardTitle>
              <CardDescription>Stripe event monitoring</CardDescription>
            </div>
            <AlertTriangle className="size-5 text-primary" />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Awaiting webhook telemetry from the payments service.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
