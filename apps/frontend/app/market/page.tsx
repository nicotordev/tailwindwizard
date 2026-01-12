"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketNavbar } from "@/components/navbar";
import { MarketHero } from "@/components/market-hero";
import { MarketActions } from "@/components/market-actions";
import { MarketTabs } from "@/components/market-tabs";
import { ItemTable, type SortKey, type SortState } from "@/components/item-table";
import { MarketSidebar } from "@/components/sidebar";
import { MarketPagination } from "@/components/pagination";
import { MarketFooter } from "@/components/footer";
import { frontendApi } from "@/lib/frontend-api";
import { marketGames } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";
import type { MarketItem } from "@/lib/data";
import type { Block } from "@/types/extended";

const PAGE_SIZE = 4;

function sortItems(items: MarketItem[], sort: SortState) {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (sort.key === "name") {
      return a.name.localeCompare(b.name) * direction;
    }
    if (sort.key === "quantity") {
      return (a.quantity - b.quantity) * direction;
    }
    return (a.priceUSD - b.priceUSD) * direction;
  });
}

function mapBlockToMarketItem(block: Block): MarketItem {
  return {
    id: block.id,
    name: block.title,
    game: block.categories?.[0]?.category?.name ?? "General",
    quantity: block.soldCount ?? 0,
    priceUSD: typeof block.price === "string" ? parseFloat(block.price) : block.price,
    iconURL: block.previews?.[0]?.url,
  };
}

export default function MarketPage() {
  const [activeTab, setActiveTab] = React.useState<string>("trending");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortState>({
    key: "name",
    direction: "asc",
  });
  const [page, setPage] = React.useState(1);
  const isMobile = useIsMobile();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await frontendApi.categories.list();
      return res.data;
    },
  });

  const { data: blocksData, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ["blocks", activeTab],
    queryFn: async () => {
      const res = await frontendApi.blocks.list({
        categorySlug: activeTab,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      });
      return res.data;
    },
  });

  const tabs = React.useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map(cat => ({
      value: cat.slug,
      label: cat.name
    }));
  }, [categoriesData]);

  React.useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0].value);
    }
  }, [tabs, activeTab]);

  const items = React.useMemo(() => {
    if (!blocksData) return [];
    return blocksData.map(mapBlockToMarketItem);
  }, [blocksData]);

  const filteredItems = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.name.toLowerCase().includes(term));
  }, [items, query]);

  const sortedItems = React.useMemo(
    () => sortItems(filteredItems, sort),
    [filteredItems, sort]
  );
  
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const pagedItems = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [page, sortedItems]);

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    setPage(1);
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketNavbar />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <MarketHero />
        <MarketActions>
          <div className="lg:hidden">
            <MarketSidebar
              mode="sheet"
              search={query}
              onSearchChange={setQuery}
              games={marketGames}
            />
          </div>
        </MarketActions>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-4">
            <MarketTabs
              value={activeTab}
              onChange={handleTabChange}
              tabs={tabs.length > 0 ? tabs : []}
            />
            <ItemTable
              items={pagedItems}
              isLoading={isLoadingBlocks}
              isMobile={isMobile}
              sort={sort}
              onSort={handleSort}
            />
            <MarketPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </section>
          <aside className="hidden lg:block">
            <MarketSidebar
              mode="static"
              search={query}
              onSearchChange={setQuery}
              games={marketGames}
            />
          </aside>
        </div>
      </div>
      <MarketFooter />
    </div>
  );
}

