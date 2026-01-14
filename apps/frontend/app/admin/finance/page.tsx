import { apiClient } from "@/lib/api"
import { FinanceOverview } from "@/components/admin/finance-overview"
import { Badge } from "@/components/ui/badge"
import type {
  AdminPurchase,
  AdminPurchaseListResponse,
  AdminWebhookStatsResponse,
} from "@/types/api-helpers"

export default async function AdminFinancePage() {
  const [purchasesResponse, webhookResponse] = await Promise.all([
    apiClient.GET("/api/v1/admin/purchases", {
      params: { query: { limit: "10" } },
      cache: "no-store",
    }),
    apiClient.GET("/api/v1/admin/finance/webhooks", {
      cache: "no-store",
    }),
  ])

  const purchases: AdminPurchase[] =
    (purchasesResponse.data as AdminPurchaseListResponse | undefined)?.data ?? []
  const webhookStats: AdminWebhookStatsResponse =
    (webhookResponse.data as AdminWebhookStatsResponse | undefined) ?? {
      last24h: { total: 0, failed: 0, pending: 0, successRate: 100 },
      lastEvents: [],
    }

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

      <FinanceOverview
        initialPurchases={purchasesResponse.error ? [] : purchases}
        initialWebhookStats={webhookStats}
      />
    </div>
  )
}
