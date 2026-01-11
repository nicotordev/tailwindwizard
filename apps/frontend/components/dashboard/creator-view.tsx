"use client";

import { Money } from "@/components/primitives/formatters";
import {
  BlockStatusBadge,
  StripeStatusBadge,
  type BlockStatus,
  type StripeStatus,
} from "@/components/primitives/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { frontendApi } from "@/lib/frontend-api";
import type { RenderJob } from "@/types/extended";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Box,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { EmptyState } from "../primitives/empty-state";
import Link from "next/link";

export function CreatorView() {
  const { data: creator, isLoading: creatorLoading } = useQuery({
    queryKey: ["creator", "me"],
    queryFn: () => frontendApi.creators.getMe().then((res) => res.data),
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["blocks", "my"],
    queryFn: () => frontendApi.blocks.listMyBlocks().then((res) => res.data),
  });

  // Mock render jobs
  const renderJobs: RenderJob[] = [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-br from-creator/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
              Revenue Engine
            </CardTitle>
            <Wallet className="size-4 text-creator" />
          </CardHeader>
          <CardContent>
            {creatorLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="space-y-1">
                <StripeStatusBadge
                  status={
                    (creator?.stripeAccountStatus as StripeStatus) ||
                    "NOT_CONNECTED"
                  }
                />
                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                  Payouts enabled
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-br from-creator/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-muted-foreground uppercase">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Vault Balance
            </CardTitle>
            <TrendingUp className="size-4 text-creator" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading tabular-nums">
              <Money amount={0} />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
              Cleared in 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-br from-creator/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-muted-foreground uppercase">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Magic Sold
            </CardTitle>
            <BarChart3 className="size-4 text-creator" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading tabular-nums">
              0
            </div>
            <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">
              +0% this cycle
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-br from-creator/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-muted-foreground uppercase">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Active Spells
            </CardTitle>
            <Box className="size-4 text-creator" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading tabular-nums">
              {blocks?.length || 0}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
              Live in marketplace
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* My Blocks Widget */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight font-heading">
                Recent Creations
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your latest Tailwind artifacts.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-creator hover:bg-creator/90 text-white rounded-xl shadow-lg shadow-creator/20 group"
              asChild
            >
              <Link href="/dashboard/blocks/new">
                <Plus className="size-4 mr-2 transition-transform group-hover:rotate-90" />
                Forge New Block
              </Link>
            </Button>
          </div>

          <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem] overflow-hidden shadow-sm">
            {blocksLoading ? (
              <CardContent className="p-6">
                <Skeleton className="h-75 w-full rounded-2xl" />
              </CardContent>
            ) : !blocks?.length ? (
              <CardContent className="p-0">
                <EmptyState
                  title="Your forge is cold"
                  description="You haven't shared any magic yet. Start selling by creating your first component."
                  variant="hero"
                  icon={Sparkles}
                  action={{
                    label: "Create First Block",
                    href: "/dashboard/blocks/new",
                    icon: Plus,
                  }}
                />
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="font-bold text-xs uppercase tracking-widest py-4">
                        Artifact Name
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest py-4">
                        Status
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-widest py-4">
                        Value
                      </TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase tracking-widest py-4">
                        Invocations
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.slice(0, 5).map((block) => (
                      <TableRow
                        key={block.id}
                        className="group hover:bg-creator/5 border-border/40 transition-colors"
                      >
                        <TableCell className="py-4 font-bold text-sm tracking-tight">
                          {block.title}
                        </TableCell>
                        <TableCell className="py-4">
                          <BlockStatusBadge
                            status={block.status as BlockStatus}
                          />
                        </TableCell>
                        <TableCell className="py-4 font-medium text-sm">
                          <Money amount={block.price} />
                        </TableCell>
                        <TableCell className="text-right py-4 font-bold tabular-nums text-sm">
                          {block.soldCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {blocks.length > 0 && (
                  <div className="px-6 py-4 bg-muted/20 border-t border-border/40 text-center">
                    <Button
                      variant="link"
                      className="text-xs text-muted-foreground hover:text-creator h-auto p-0 gap-1"
                      asChild
                    >
                      <Link href="/dashboard/blocks">
                        Manage all artifacts <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>

        {/* Render Status & Marketplace Insights */}
        <aside className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-creator/10 flex items-center justify-center text-creator">
                <RefreshCw className="size-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight font-heading">
                Render Queue
              </h2>
            </div>
            <Card className="bg-card/30 backdrop-blur-md rounded-[2rem] border-border/40 overflow-hidden shadow-sm">
              <CardContent className="p-8">
                {!renderJobs.length ? (
                  <EmptyState
                    title="No active tasks"
                    description="The magic forge is idle. All previews are rendered."
                    icon={RefreshCw}
                    variant="minimal"
                    className="py-12"
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Job items would go here */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-creator/10 flex items-center justify-center text-creator">
                <TrendingUp className="size-4" />
              </div>
              <h2 className="text-xl font-bold tracking-tight font-heading">
                Market Insights
              </h2>
            </div>
            <Card className="bg-card/30 backdrop-blur-md rounded-[2rem] border-border/40 p-6 shadow-sm">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Creators focusing on <strong>E-commerce dashboards</strong> are
                seeing a 24% increase in invocations this week.
              </p>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
