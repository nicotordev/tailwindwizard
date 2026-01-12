"use client"

import * as React from "react"
import { frontendApi } from "@/lib/frontend-api"
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Money, DateDisplay } from "@/components/primitives/formatters"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FinanceOverviewProps {
  initialPurchases: any[]
  initialWebhookStats: any
}

export function FinanceOverview({ initialPurchases, initialWebhookStats }: FinanceOverviewProps) {
  const [purchases] = React.useState(initialPurchases)
  const [webhookStats] = React.useState(initialWebhookStats)

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Success Rate (24h)
            </CardTitle>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-heading font-bold">
                {webhookStats.last24h.successRate.toFixed(1)}%
              </span>
              <Badge variant={webhookStats.last24h.successRate > 95 ? "secondary" : "destructive"} className="rounded-lg">
                {webhookStats.last24h.failed} failed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={webhookStats.last24h.successRate} 
              className="h-2 rounded-full" 
            />
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="size-3" />
              Total {webhookStats.last24h.total} events received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Webhook Health
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "size-3 rounded-full animate-pulse",
                webhookStats.last24h.failed > 0 ? "bg-amber-500" : "bg-green-500"
              )} />
              <span className="text-2xl font-heading font-bold">
                {webhookStats.last24h.failed > 5 ? "Critical" : webhookStats.last24h.failed > 0 ? "Degraded" : "Healthy"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {webhookStats.last24h.pending} events currently in queue for processing.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Recent Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[120px] overflow-y-auto px-6 space-y-3 pb-4">
              {webhookStats.lastEvents.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-mono font-medium truncate max-w-[120px]">{event.eventType}</span>
                    <span className="text-muted-foreground">{new Date(event.receivedAt).toLocaleTimeString()}</span>
                  </div>
                  <Badge 
                    variant={event.status === "PROCESSED" ? "secondary" : event.status === "FAILED" ? "destructive" : "outline"}
                    className="rounded-md px-1.5 py-0 text-[10px]"
                  >
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-8 pt-8">
            <div>
              <CardTitle className="text-2xl font-heading">Global order feed</CardTitle>
              <CardDescription>Real-time marketplace transactions</CardDescription>
            </div>
            <Receipt className="size-6 text-primary" />
          </CardHeader>
          <CardContent className="p-0">
            {purchases.length === 0 ? (
              <div className="py-20 text-center">
                <Receipt className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-heading font-semibold">No purchases yet</h3>
                <p className="text-sm text-muted-foreground">Marketplace transactions will appear here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="pl-8">Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-8 text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-muted/20 border-border/40 group">
                      <TableCell className="pl-8">
                        <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          {purchase.id.slice(0, 8)}...
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7 rounded-lg">
                            <AvatarImage src={purchase.buyer?.avatarUrl} />
                            <AvatarFallback className="rounded-lg text-[10px] uppercase">
                              {purchase.buyer?.email[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{purchase.buyer?.name || "Anonymous"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {purchase.lineItems[0]?.block?.title || "Unknown Block"}
                            {purchase.lineItems.length > 1 && ` + ${purchase.lineItems.length - 1} more`}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {purchase.lineItems[0]?.licenseType} License
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Money amount={purchase.totalAmount} className="font-bold" />
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "rounded-lg",
                            purchase.status === "PAID" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            purchase.status === "PENDING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                            "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right text-xs text-muted-foreground">
                        <DateDisplay date={purchase.createdAt} format="short" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
