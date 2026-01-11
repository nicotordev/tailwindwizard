import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Receipt, Package, ExternalLink, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Money, DateDisplay } from "@/components/primitives/formatters"
import { Badge } from "@/components/ui/badge"
import type { ExtendedPurchase } from "@/types/extended"
import { cn } from "@/lib/utils"

interface PurchaseDetailViewProps {
  purchase: ExtendedPurchase
}

export function PurchaseDetailView({ purchase }: PurchaseDetailViewProps) {
  const isPaid = purchase.status === "PAID"

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading">Order #{purchase.id.slice(-8).toUpperCase()}</h1>
            <Badge 
              variant={isPaid ? "default" : "secondary"}
              className={cn(isPaid ? "bg-green-500/10 text-green-500 border-green-500/20" : "")}
            >
              {purchase.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Purchased on <DateDisplay date={purchase.createdAt} format="long" />
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl">
            <Receipt className="size-4 mr-2" />
            Invoice
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <HelpCircle className="size-4 mr-2" />
            Support
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <CardTitle className="text-lg font-bold">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {purchase.lineItems?.map((item, idx) => (
                  <div key={idx} className="p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center border border-border/60">
                        <Package className="size-7 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <Link 
                          href={`/block/${item.block.slug}`}
                          className="font-bold hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {item.block.title}
                          <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          {item.licenseType || "PERSONAL"} LICENSE
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Money amount={Number(item.amount || purchase.totalAmount)} className="font-bold" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-xl font-bold font-heading px-2">Delivery Status</h2>
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">Accessing your magic</p>
                  <p className="text-sm text-muted-foreground">
                    These blocks are now available in your library.
                  </p>
                </div>
                <Button variant="secondary" asChild className="rounded-xl border-border/60">
                  <Link href="/dashboard/library">
                    View Library
                  </Link>
                </Button>
              </div>
            </Card>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-bold">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <Money amount={Number(purchase.totalAmount)} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <Money amount={0} />
              </div>
              <Separator className="bg-border/40" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <Money amount={Number(purchase.totalAmount)} className="text-xl font-black text-primary" />
              </div>
              
              <div className="pt-4 flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-3 rounded-2xl border border-border/40">
                <CreditCard className="size-4 shrink-0" />
                <span>Paid via Stripe **** **** **** 4242</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 rounded-3xl p-6">
            <h3 className="font-bold mb-2">Need help with this order?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any issues with your purchase or the component files, our wizards are here to help.
            </p>
            <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/5">
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />
}
