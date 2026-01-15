"use client";

import { useCollections } from "@/hooks/use-collections";
import { apiClient } from "@/lib/api-client";
import { Block } from "@/types/extended";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  ChevronRight,
  Folder,
  Layers,
  LayoutGrid,
  Loader2,
  Plus,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "@/components/primitives/formatters";
import { CollectionCard } from "../dashboard/collections/collection-card";
import Image from "next/image";

export function ForgeryOverview() {
  const { data: blocksData, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ["creator-blocks-summary"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/creators/me/blocks", {
        params: { query: { limit: 5 } },
      });
      if (error) throw new Error("Failed to fetch blocks");
      return data;
    },
  });

  const { data: collections, isLoading: isLoadingCollections } =
    useCollections();

  const isLoading = isLoadingBlocks || isLoadingCollections;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blocks = blocksData?.data || [];
  const stats = {
    totalBlocks: blocksData?.meta.total || 0,
    totalSales: blocks.reduce((acc, b) => acc + (b.soldCount || 0), 0),
    avgRating:
      blocks.length > 0
        ? blocks.reduce((acc, b) => acc + Number(b.ratingAvg || 0), 0) /
          blocks.length
        : 0,
    totalCollections: collections?.length || 0,
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-primary/10 text-primary border-none px-3 py-1"
          >
            Creator Dashboard
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight font-heading">
            Welcome to the <span className="text-primary italic">Forgery</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Monitor your craft, manage your collections, and track your
            performance in the marketplace.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="rounded-2xl h-11 px-6">
            <Link href="/dashboard/forgery/blocks/new">
              <Plus className="mr-2 size-4" />
              New Block
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Blocks",
            value: stats.totalBlocks,
            icon: Box,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Sales",
            value: stats.totalSales,
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Avg. Rating",
            value: stats.avgRating.toFixed(1),
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Collections",
            value: stats.totalCollections,
            icon: Layers,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none bg-card/50 backdrop-blur-md rounded-3xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}
                >
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Blocks */}
        <Card className="lg:col-span-2 border-none bg-card/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid className="size-5 text-primary" />
                Recent Blocks
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                Your latest component submissions.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <Link href="/dashboard/forgery/blocks">
                View All
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {blocks.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground italic">
                  No blocks created yet.
                </div>
              ) : (
                blocks.map((block) => (
                  <Link
                    key={block.id}
                    href={`/dashboard/forgery/blocks/${block.id}`}
                    className="flex items-center gap-4 p-6 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="size-14 rounded-2xl bg-muted overflow-hidden flex-shrink-0 border border-border/50 group-hover:border-primary/30 transition-colors">
                      {block.screenshot ? (
                        <Image
                          src={block.screenshot}
                          alt=""
                          width={56}
                          height={56}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <Box className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate group-hover:text-primary transition-colors">
                        {block.title}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        /{block.slug}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Money
                        amount={block.price as number}
                        className="font-bold text-sm"
                      />
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 font-bold uppercase"
                      >
                        {block.status}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Collections Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Folder className="size-5 text-primary" />
              Collections
            </h3>
            <Button variant="ghost" size="sm" asChild className="rounded-xl">
              <Link href="/dashboard/forgery/collections">
                See All
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {collections?.slice(0, 3).map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                // Simplified card or use as is
              />
            ))}
            {(!collections || collections.length === 0) && (
              <Card className="border-dashed bg-transparent border-2 rounded-3xl p-8 text-center space-y-4">
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground/50">
                  <Layers className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">No collections</p>
                  <p className="text-xs text-muted-foreground">
                    Group blocks to sell as bundles.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl w-full"
                  asChild
                >
                  <Link href="/dashboard/forgery/collections">
                    Get Started
                  </Link>
                </Button>
              </Card>
            )}
          </div>

          {/* Quick Tips or Announcements */}
          <Card className="border-none bg-primary/5 rounded-[2rem] p-6 relative overflow-hidden group">
             <div className="relative z-10 space-y-3">
                <h4 className="font-bold text-primary">Creator Tip</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High-quality screenshots and detailed descriptions can increase your block conversion rate by up to 40%.
                </p>
                <Button variant="link" className="text-primary p-0 h-auto text-xs font-bold hover:no-underline">
                  Learn more <ChevronRight className="ml-1 size-3" />
                </Button>
             </div>
             <div className="absolute -right-4 -bottom-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </Card>
        </div>
      </div>
    </div>
  );
}
