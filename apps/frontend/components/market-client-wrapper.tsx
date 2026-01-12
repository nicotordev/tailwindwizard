"use client";

import {
  ItemTable,
  type SortKey,
  type SortState,
} from "@/components/item-table";
import { MarketActions } from "@/components/market-actions";
import { MarketTabs } from "@/components/market-tabs";
import { MarketPagination } from "@/components/pagination";
import { MarketSidebar } from "@/components/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { MarketItem } from "@/lib/data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

type MarketClientWrapperProps = {
  initialTab: string;
  initialQuery: string;
  initialSort: SortState;
  initialPage: number;
  totalPages: number;
  items: MarketItem[];
  games: string[];
};

export function MarketClientWrapper({
  initialTab,
  initialQuery,
  initialSort,
  initialPage,
  totalPages,
  items,
  games,
}: MarketClientWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // We use a local state for the search query to avoid jitter while typing,
  // but we sync it with the URL on a delay or on enter.
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const debounceTimer = React.useRef<NodeJS.Timeout>(null);

  const [isPending, startTransition] = React.useTransition();

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateUrl = (params: Record<string, string | number | null>) => {
    const query = createQueryString(params);
    startTransition(() => {
      router.push(`${pathname}?${query}`, { scroll: false });
    });
  };

  const handleTabChange = (value: string) => {
    updateUrl({ tab: value, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateUrl({ q: value, page: 1 });
    }, 500);
  };

  const handleSort = (key: SortKey) => {
    const newDir =
      initialSort.key === key && initialSort.direction === "asc"
        ? "desc"
        : "asc";
    updateUrl({ sort: key, dir: newDir, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page });
  };

  return (
    <>
      <MarketActions>
        <div className="lg:hidden">
          <MarketSidebar
            mode="sheet"
            search={searchQuery}
            onSearchChange={handleSearchChange}
            games={games}
          />
        </div>
      </MarketActions>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-4">
          <MarketTabs
            value={initialTab}
            onChange={handleTabChange}
          />
          <ItemTable
            items={items}
            isLoading={isPending}
            isMobile={isMobile}
            sort={initialSort}
            onSort={handleSort}
            showActions={initialTab !== "most-sold"}
          />
          <MarketPagination
            page={initialPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>

        <aside className="hidden lg:block">
          <MarketSidebar
            mode="static"
            search={searchQuery}
            onSearchChange={handleSearchChange}
            games={games}
          />
        </aside>
      </div>
    </>
  );
}
