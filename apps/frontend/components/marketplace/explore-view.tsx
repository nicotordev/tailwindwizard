"use client";

import { BlockRow } from "@/components/marketplace/block-row";
import { EmptyState } from "@/components/primitives/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { components } from "@/types/api";
import type { Block } from "@/types/extended";
import {
  ArrowRight,
  ChevronRight,
  History,
  Info,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import * as React from "react";

type Category = components["schemas"]["Category"];

interface ExploreViewProps {
  initialBlocks: Block[];
  categories?: Category[];
}

export function ExploreView({ initialBlocks, categories }: ExploreViewProps) {
  const [search, setSearch] = React.useState("");
  const [framework, setFramework] = React.useState("all");
  const [styling, setStyling] = React.useState("all");
  const [pricing, setPricing] = React.useState("all");
  const [category, setCategory] = React.useState("all");

  const filteredBlocks = React.useMemo(() => {
    return initialBlocks.filter((block) => {
      const matchesSearch =
        block.title.toLowerCase().includes(search.toLowerCase()) ||
        (block.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesFramework =
        framework === "all" || block.framework === framework;
      const matchesStyling =
        styling === "all" || block.stylingEngine === styling;
      const matchesPricing =
        pricing === "all" ||
        (pricing === "free"
          ? Number(block.price) === 0
          : Number(block.price) > 0);
      const matchesCategory =
        category === "all" ||
        block.categories?.some((entry) => entry.category.slug === category);

      return (
        matchesSearch &&
        matchesFramework &&
        matchesStyling &&
        matchesPricing &&
        matchesCategory
      );
    });
  }, [category, framework, initialBlocks, pricing, search, styling]);

  const resetFilters = () => {
    setSearch("");
    setFramework("all");
    setStyling("all");
    setPricing("all");
    setCategory("all");
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Premium Wizard Hero */}
      <section className="relative isolate overflow-hidden rounded-[2.5rem] bg-card/10 border border-border/50 p-10 md:p-16">
        <div className="absolute left-[-10%] top-[-20%] h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px] -z-10" />
        <div className="absolute right-[-5%] bottom-[-30%] h-[350px] w-[350px] rounded-full bg-secondary/30 blur-[100px] -z-10" />

        <div className="max-w-3xl space-y-4">
          <Badge
            variant="secondary"
            className="px-3 py-1 font-medium bg-primary/10 text-primary border-primary/20"
          >
            <Sparkles className="size-3 mr-2" />
            Curated Community Marketplace
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight text-foreground leading-[1.1]">
            Find the perfect <br />
            <span className="text-primary italic">UI Components.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Browse and trade premium Tailwind blocks crafted by top-tier
            creators. The industrial power of a marketplace with the magic of
            Tailwind Wizard.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-12">
        {/* Market Hub */}
        <div className="space-y-8">
          <Tabs defaultValue="popular" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-muted/50 p-1 rounded-2xl h-12">
                {[
                  { id: "popular", label: "Popular", icon: Trophy },
                  { id: "new", label: "Newly Added", icon: Zap },
                  { id: "history", label: "Recent Activity", icon: History },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "px-6 py-2 rounded-xl text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    )}
                  >
                    <tab.icon className="size-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border border-border/50">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                {filteredBlocks.length} Blocks Available
              </div>
            </div>

            <TabsContent value="popular" className="mt-0 outline-none">
              {!filteredBlocks.length ? (
                <EmptyState
                  title="No blocks found"
                  description="We couldn't find any blocks matching your current filters."
                  icon={Search}
                  action={{
                    label: "Clear all filters",
                    onClick: resetFilters,
                  }}
                  variant="hero"
                />
              ) : (
                <div className="flex flex-col">
                  {filteredBlocks.map((block) => (
                    <BlockRow key={block.id} block={block} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-0 outline-none">
              <div className="bg-card/20 border border-border/40 rounded-[2rem] p-20 text-center text-muted-foreground font-heading">
                Discovery engine warming up...
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 outline-none">
              <div className="bg-card/20 border border-border/40 rounded-[2rem] p-20 text-center text-muted-foreground font-heading">
                Activity feed coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Wizard Filter Sidebar */}
        <aside className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground font-heading flex items-center gap-2">
              <Search className="size-4 text-primary" />
              Quick Find
            </h3>
            <div className="relative group">
              <Input
                placeholder="Search the market..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card/40 border-border/50 rounded-2xl h-12 pl-4 pr-12 transition-all focus:border-primary/50 focus:ring-primary/20"
              />
              <div className="absolute right-3 top-2.5 size-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center opacity-0 group-focus-within:opacity-100 transition-opacity">
                <ChevronRight className="size-4" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground font-heading">
              Categories
            </h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setCategory("all")}
                className={cn(
                  "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-2xl transition-all border",
                  category === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card/20 border-border/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <span>All Categories</span>
                {category === "all" && <ChevronRight className="size-4" />}
              </button>
              {categories?.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug || "")}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-2xl transition-all border",
                    category === cat.slug
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-card/20 border-border/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                  {category === cat.slug && <ChevronRight className="size-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
              <Info className="size-3.5" />
              <span>Market Safety</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Trading UI blocks is secure. All code is verified and source
              access is granted instantly upon purchase.
            </p>
            <Button
              variant="link"
              className="px-0 text-primary text-xs h-auto font-bold hover:no-underline flex items-center gap-1 group"
            >
              FAQ & Security{" "}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Tech Stack
              </label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-card/40 border-border/50 rounded-2xl h-11 focus:ring-primary/20">
                  <SelectValue placeholder="Framework" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                  <SelectItem value="all">Any Stack</SelectItem>
                  <SelectItem value="REACT">React</SelectItem>
                  <SelectItem value="VUE">Vue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Price Range
              </label>
              <Select value={pricing} onValueChange={setPricing}>
                <SelectTrigger className="bg-card/40 border-border/50 rounded-2xl h-11 focus:ring-primary/20">
                  <SelectValue placeholder="Pricing" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="paid">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
