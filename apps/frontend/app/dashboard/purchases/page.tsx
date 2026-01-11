import { Metadata } from "next"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { EmptyState } from "@/components/primitives/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateDisplay, Money } from "@/components/primitives/formatters"
import { cn } from "@/lib/utils"
import { ArrowRight, Package, Receipt, ShoppingCart } from "lucide-react"
import type { ExtendedPurchase } from "@/types/extended"

export const metadata: Metadata = {
  title: "Purchases | TailwindWizard",
  description: "Review your past orders and receipts.",
}

export default async function PurchasesPage() {
  const { data, error } = await apiClient.GET("/api/v1/users/me/purchases", {
    cache: "no-store",
  })

  const purchases = (data || []) as ExtendedPurchase[]

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Purchases</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Acquisition history
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Track your orders, receipts, and delivery details in one place.
        </p>
      </div>

      {error || !purchases.length ? (
        <EmptyState
          title="No purchases yet"
          description="Browse the marketplace to add your first block."
          icon={ShoppingCart}
          variant="hero"
          action={{
            label: "Explore the Marketplace",
            href: "/dashboard/market",
          }}
        />
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const statusClass = getStatusClass(purchase.status)
            return (
              <Card
                key={purchase.id}
                className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden"
              >
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-heading">
                      Order #{purchase.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Purchased <DateDisplay date={purchase.createdAt} format="long" />
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border",
                        statusClass
                      )}
                    >
                      {purchase.status}
                    </span>
                    <Badge variant="secondary" className="gap-2">
                      <Receipt className="size-3" />
                      Receipt
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Package className="size-4" />
                      <span>
                        {purchase.lineItems?.length || 0} items in this order
                      </span>
                    </div>
                    <Money
                      amount={Number(purchase.totalAmount)}
                      currency={purchase.currency}
                      className="text-lg font-semibold text-foreground"
                    />
                  </div>

                  <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground space-y-2">
                    {(purchase.lineItems || []).length ? (
                      purchase.lineItems?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {item.block.title}
                          </span>
                          <span className="text-xs font-mono">{item.block.slug}</span>
                        </div>
                      ))
                    ) : (
                      <p>Line items will appear once fulfillment syncs.</p>
                    )}
                    {(purchase.lineItems?.length || 0) > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{purchase.lineItems!.length - 3} more items
                      </p>
                    )}
                  </div>

                  <Button asChild className="rounded-xl">
                    <Link href={`/dashboard/purchases/${purchase.id}`}>
                      View order <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "REFUNDED":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    case "PENDING":
      return "bg-muted text-muted-foreground border-border"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}
