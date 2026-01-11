import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/primitives/empty-state"
import { Users } from "lucide-react"

export default function AdminCreatorsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Creators</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Creator management
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Review creator accounts, Stripe status, and approval history.
        </p>
      </div>

      <EmptyState
        title="Creator directory not connected"
        description="Admin creator endpoints are not available yet. Connect the API to manage approvals."
        icon={Users}
        variant="hero"
      />
    </div>
  )
}
