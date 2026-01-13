"use client";

import {
  Activity,
  Building2,
  ChevronRight,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Money } from "@/components/primitives/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types based on the shared schema and internal logic
import type { components } from "@/types/api";
type Block = components["schemas"]["Block"];

interface MarketProductViewProps {
  block: Block;
  marketData?: MarketData;
}

type PlanId = "personal" | "team" | "enterprise";
type Plan = {
  id: PlanId;
  name: string;
  description: string;
  icon: LucideIcon;
  price: number;
  features: string[];
};

type MarketData = {
  priceHistory: { date: string; price: number }[];
  buyOrders: { price: number; quantity: number }[];
  sellOrders: { price: number; quantity: number }[];
  recentActivity: {
    type: string;
    price: number;
    date: string;
    user: string;
  }[];
};

export function MarketProductView({
  block,
  marketData,
}: MarketProductViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("personal");

  const basePrice =
    typeof block.price === "string"
      ? parseFloat(block.price)
      : block.price || 0;
  const primaryCategory = block.categories?.[0]?.category;
  const heroImage = block.screenshot ?? block.previews?.[0]?.url;
  const resolvedMarketData: MarketData = marketData ?? {
    priceHistory: [],
    buyOrders: [],
    sellOrders: [],
    recentActivity: [],
  };

  const plans: Plan[] = [
    {
      id: "personal",
      name: "Personal",
      description: "For individual developers",
      icon: Package,
      price: basePrice,
      features: ["Single User License", "Lifetime Updates", "Public Support"],
    },
    {
      id: "team",
      name: "Team",
      description: "For small development teams",
      icon: Users,
      price: basePrice * 4,
      features: [
        "Up to 5 Users",
        "Priority Support",
        "Shared License",
        "Commercial Use",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      icon: Building2,
      price: basePrice * 12,
      features: [
        "Unlimited Users",
        "24/7 Support",
        "SLA Guarantee",
        "Custom Deployment",
      ],
    },
  ];

  const activePlan = plans.find((p) => p.id === selectedPlan) ?? plans[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground/60">
        <Link href="/market" className="hover:text-primary transition-colors">
          Market
        </Link>
        <ChevronRight className="size-4 opacity-50" />
        <span className="hover:text-primary transition-colors cursor-pointer">
          {primaryCategory?.name || "Blocks"}
        </span>
        <ChevronRight className="size-4 opacity-50" />
        <span className="text-foreground font-medium">{block.title}</span>
      </nav>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/20 group shadow-2xl">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={block.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-transparent">
                <Zap className="size-32 text-primary/10 animate-pulse" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background via-background/40 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
              <div className="space-y-2">
                <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-none text-xs uppercase tracking-tighter">
                  Verified Asset
                </Badge>
                <h1 className="text-5xl font-heading font-black tracking-tight text-white drop-shadow-2xl">
                  {block.title}
                </h1>
              </div>
              <div className="flex gap-2">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="text-[10px] text-white/50 uppercase font-black">
                    Framework
                  </div>
                  <div className="text-sm font-bold text-white uppercase">
                    {block.framework}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[2rem] bg-card/30 border border-border/40 backdrop-blur-md space-y-2">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div className="text-2xl font-black font-heading">
                High Demand
              </div>
              <p className="text-sm text-muted-foreground">
                Trending in {primaryCategory?.name || "Components"} this week.
              </p>
            </div>
            <div className="p-6 rounded-[2rem] bg-card/30 border border-border/40 backdrop-blur-md space-y-2">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="size-5 text-primary" />
              </div>
              <div className="text-2xl font-black font-heading">
                Active Updates
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated by {block.creator?.displayName || "Creator"}{" "}
                recently.
              </p>
            </div>
            <div className="p-6 rounded-[2rem] bg-card/30 border border-border/40 backdrop-blur-md space-y-2">
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Star className="size-5 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-heading">
                {Number(block.ratingAvg || 0).toFixed(1)} Rating
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {block.ratingCount || 0} verified customer reviews.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-bold">
              About this Block
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              {block.description ||
                "Enhance your development workflow with this professionally crafted block. Designed for performance, accessibility, and maximum flexibility. Built by experts for developers who value quality and speed in their development cycle."}
            </p>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card/30 backdrop-blur-3xl border-border/40 rounded-[2.5rem] shadow-2xl p-8 sticky top-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Market Value
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-heading font-black text-primary">
                    <Money
                      amount={activePlan.price}
                      currency={block.currency}
                    />
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                    <Package className="size-3" />
                    License Package
                  </div>
                </div>
                <div className="grid gap-3">
                    {plans.map((plan) => {
                      const Icon = plan.icon;
                      const isSelected = selectedPlan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={cn(
                            "group flex items-center gap-4 p-5 rounded-3xl border transition-all duration-500 text-left outline-none",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground shadow-2xl shadow-primary/40 scale-[1.02]"
                            : "bg-muted/30 border-border/10 hover:border-primary/50 text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "size-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isSelected
                              ? "bg-white/20 rotate-12"
                              : "bg-primary/10 group-hover:scale-110"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-6",
                              isSelected ? "text-white" : "text-primary"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-base">
                            {plan.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-medium truncate",
                              isSelected
                                ? "text-white/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {plan.description}
                          </div>
                        </div>
                        <div className="font-black text-lg">
                          <Money
                            amount={plan.price}
                            currency={block.currency}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 py-6 border-y border-border/10">
                <ul className="space-y-4">
                  {activePlan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                    >
                      <div className="size-2 rounded-full bg-primary shadow-sm" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <Button className="w-full h-20 rounded-3xl text-xl font-black gap-4 group bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95">
                  <ShoppingCart className="size-7 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
                  Purchase Block
                </Button>
                <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">
                  <span>Instant Delivery</span>
                  <div className="size-1 rounded-full bg-muted-foreground/30" />
                  <span>Source Included</span>
                  <div className="size-1 rounded-full bg-muted-foreground/30" />
                  <span>Commercial Use</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Market Data Visualization */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          <Card className="bg-card/30 border-border/40 rounded-[3rem] overflow-hidden shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 px-10 py-8 bg-muted/20">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-heading font-black">
                  Market Dynamics
                </CardTitle>
                <CardDescription className="text-base font-medium">
                  Real-time price analytics and sales volume
                </CardDescription>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-xs px-4 py-1">
                  LIVE MARKET
                </Badge>
                <span className="text-2xl font-black text-emerald-500 mt-2">
                  +14.2%
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-112.5 p-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resolvedMarketData.priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="8 8"
                    vertical={false}
                    stroke="rgba(255,255,255,0.03)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontWeight={800}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                    dy={10}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={10}
                    fontWeight={800}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--primary)", strokeWidth: 2 }}
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.9)",
                      borderRadius: "24px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                      padding: "16px",
                    }}
                    itemStyle={{
                      color: "var(--primary)",
                      fontWeight: 900,
                      fontSize: "16px",
                    }}
                    labelStyle={{
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 800,
                      marginBottom: "4px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="var(--primary)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity Table */}
          <Card className="bg-card/30 border-border/40 rounded-[3rem] overflow-hidden shadow-xl">
            <CardHeader className="px-10 py-8 border-b border-border/10">
              <CardTitle className="text-3xl font-heading font-black flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Activity className="size-6 text-primary" />
                </div>
                Market Stream
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border/5">
                    <th className="px-10 py-6 text-left">Buyer Identity</th>
                    <th className="px-10 py-6 text-left">Operation</th>
                    <th className="px-10 py-6 text-right">Value</th>
                    <th className="px-10 py-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {resolvedMarketData.recentActivity.length ? (
                    resolvedMarketData.recentActivity.map((activity, i) => (
                      <tr
                        key={i}
                        className="group hover:bg-primary/3 transition-colors cursor-default"
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-linear-to-br from-muted to-muted/50 p-px">
                              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-[10px] font-black">
                                {activity.user.substring(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="font-bold text-base">
                              {activity.user}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <Badge
                            variant="outline"
                            className="rounded-xl px-4 py-1 border-border/50 bg-background/50 font-bold text-[10px] uppercase tracking-tighter"
                          >
                            {activity.type}
                          </Badge>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="font-black text-primary text-lg">
                            <Money amount={activity.price} />
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right font-bold text-muted-foreground/60 text-sm">
                          {activity.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-10 py-10 text-center text-sm text-muted-foreground"
                      >
                        No market activity yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Market Depth */}
        <div className="space-y-6">
          <Card className="bg-card/30 border-border/40 rounded-[3rem] overflow-hidden flex flex-col shadow-xl">
            <CardHeader className="px-8 py-8 border-b border-border/10 bg-primary/5">
              <CardTitle className="text-xl font-heading font-black uppercase tracking-tighter">
                Current Liquidity
              </CardTitle>
              <CardDescription className="font-bold text-xs uppercase tracking-widest text-primary">
                Pending Buy/Sell Interest
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-border/10">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-2">
                    <span>Bid Price</span>
                    <span>Vol (Qty: 1)</span>
                  </div>
                  <div className="space-y-3">
                    {resolvedMarketData.buyOrders.length ? (
                      resolvedMarketData.buyOrders.map((order, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center group cursor-pointer p-4 rounded-2xl transition-all duration-300 relative overflow-hidden bg-background/40 hover:bg-background/60 border border-border/5 hover:border-primary/20"
                        >
                          <div
                            className="absolute inset-y-0 right-0 bg-primary/10 transition-all duration-700"
                            style={{
                              width: `${(order.quantity / 512) * 100}%`,
                            }}
                          />
                          <span className="font-black text-lg relative z-10">
                            <Money amount={order.price} />
                          </span>
                          <span className="text-primary font-black font-mono relative z-10">
                            {order.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/30 bg-muted/20 p-6 text-center text-xs font-semibold text-muted-foreground">
                        No buy orders yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-2">
                    <span>Ask Price</span>
                    <span>Vol (Qty: 1)</span>
                  </div>
                  <div className="space-y-3">
                    {resolvedMarketData.sellOrders.length ? (
                      resolvedMarketData.sellOrders.map((order, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center group cursor-pointer p-4 rounded-2xl transition-all duration-300 relative overflow-hidden bg-background/40 hover:bg-background/60 border border-border/5 hover:border-destructive/20"
                        >
                          <div
                            className="absolute inset-y-0 right-0 bg-destructive/10 transition-all duration-700"
                            style={{ width: `${(order.quantity / 20) * 100}%` }}
                          />
                          <span className="font-black text-lg relative z-10">
                            <Money amount={order.price} />
                          </span>
                          <span className="text-destructive font-black font-mono relative z-10">
                            {order.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/30 bg-muted/20 p-6 text-center text-xs font-semibold text-muted-foreground">
                        No sell orders yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-8 bg-muted/20 border-t border-border/10">
              <Button
                variant="ghost"
                className="w-full font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all rounded-2xl h-12"
              >
                System Full Analytics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
