"use client";

import { DateDisplay, Money } from "@/components/primitives/formatters";
import { DeliveryStatusBadge } from "@/components/primitives/status-badges";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { frontendApi } from "@/lib/frontend-api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock,
  Download,
  LayoutGrid,
  Package,
  ShoppingCart,
  Sparkles,
  Terminal,
} from "lucide-react";
import { EmptyState } from "../primitives/empty-state";

export function BuyerView() {
  const { data: licenses, isLoading: licensesLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: () => frontendApi.licenses.list().then((res) => res.data),
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["purchases"],
    queryFn: () => frontendApi.purchases.list().then((res) => res.data),
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* My Blocks Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-heading">
              My Spellbook
            </h2>
            <p className="text-muted-foreground text-sm">
              Your collection of acquired Tailwind magic.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex gap-2 hover:bg-primary/5"
          >
            <LayoutGrid className="size-4" />
            View All
          </Button>
        </div>

        {licensesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : !licenses?.length ? (
          <EmptyState
            title="Your spellbook is empty"
            description="Explore the marketplace to find the perfect components for your next project."
            icon={Package}
            variant="hero"
            action={{
              label: "Discover Magic",
              href: "/market",
              icon: Sparkles,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((license) => (
              <Card
                key={license.id}
                className="group relative overflow-hidden bg-card/40 backdrop-blur-xl border-border/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 rounded-3xl"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">
                      {license.block?.title || "Enchanted Component"}
                    </CardTitle>
                    <DeliveryStatusBadge status={license.deliveryStatus} />
                  </div>
                  <CardDescription>
                    Acquired{" "}
                    <DateDisplay date={license.createdAt} format="relative" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="h-32 w-full rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-muted/30 transition-colors border border-dashed border-border/60">
                    <Package className="size-8 opacity-20" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2 rounded-xl h-10 shadow-lg shadow-primary/10"
                      size="sm"
                    >
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 gap-2 rounded-xl h-10 border-border/60"
                      size="sm"
                    >
                      <Terminal className="size-4" />
                      CLI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Purchase History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-builder/10 flex items-center justify-center text-builder">
              <ShoppingCart className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-heading">
              Acquisition History
            </h2>
          </div>
          <Card className="bg-card/30 backdrop-blur-md rounded-[2rem] border-border/40 overflow-hidden shadow-sm">
            <CardContent className="p-6">
              {purchasesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : !purchases?.length ? (
                <EmptyState
                  title="No history yet"
                  description="Your transactions will appear here."
                  icon={ShoppingCart}
                  variant="minimal"
                />
              ) : (
                <div className="divide-y divide-border/40">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between py-4 group first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                          Order #{purchase.id.slice(-6).toUpperCase()}
                        </p>
                        <DateDisplay
                          date={purchase.createdAt}
                          className="text-xs font-medium"
                        />
                      </div>
                      <div className="text-right space-y-1">
                        <Money
                          amount={Number(purchase.totalAmount)}
                          className="block text-sm font-bold text-foreground"
                        />
                        <span
                          className={cn(
                            "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border",
                            purchase.status === "PAID"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {purchase.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {(purchases?.length ?? 0) > 0 && (
              <div className="px-6 py-4 bg-muted/20 border-t border-border/40 text-center">
                <Button
                  variant="link"
                  className="text-xs text-muted-foreground hover:text-primary h-auto p-0 gap-1"
                >
                  View full history <ArrowRight className="size-3" />
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* Pending Reviews */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-builder/10 flex items-center justify-center text-builder">
              <Sparkles className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-heading">
              Feedback & Reviews
            </h2>
          </div>
          <Card className="bg-card/30 backdrop-blur-md rounded-[2rem] border-border/40 overflow-hidden shadow-sm">
            <CardContent className="p-8">
              <EmptyState
                title="All caught up!"
                description="Your magic is already well-documented. You've reviewed all your spells."
                icon={Clock}
                variant="minimal"
                className="py-12"
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
