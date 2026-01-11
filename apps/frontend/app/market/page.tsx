"use client";

import * as React from "react";
import { MarketNavbar } from "@/components/navbar";
import { MarketHero } from "@/components/market-hero";
import { MarketActions } from "@/components/market-actions";
import { MarketTabs } from "@/components/market-tabs";
import { ItemTable, type SortKey, type SortState } from "@/components/item-table";
import { MarketSidebar } from "@/components/sidebar";
import { MarketPagination } from "@/components/pagination";
import { MarketFooter } from "@/components/footer";
import {
  marketData,
  marketTabs,
  marketGames,
  type MarketItem,
  type MarketTabKey,
} from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";

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

export default function MarketPage() {
  const [activeTab, setActiveTab] = React.useState<MarketTabKey>("economia");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortState>({
    key: "name",
    direction: "asc",
  });
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const loadingRef = React.useRef<number | null>(null);
  const isMobile = useIsMobile();

  const items = marketData[activeTab];
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

  React.useEffect(() => {
    return () => {
      if (loadingRef.current) window.clearTimeout(loadingRef.current);
    };
  }, []);

  const handleTabChange = (value: string) => {
    const next = value as MarketTabKey;
    setActiveTab(next);
    setPage(1);
    setIsLoading(true);
    if (loadingRef.current) window.clearTimeout(loadingRef.current);
    loadingRef.current = window.setTimeout(() => setIsLoading(false), 250);
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
              tabs={marketTabs}
            />
            <ItemTable
              items={pagedItems}
              isLoading={isLoading}
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
