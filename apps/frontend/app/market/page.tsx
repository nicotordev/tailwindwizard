import { MarketFooter } from "@/components/footer";
import { type SortKey, type SortState } from "@/components/item-table";
import { MarketClientWrapper } from "@/components/market-client-wrapper";
import { MarketHero } from "@/components/market-hero";
import { MarketNavbar } from "@/components/navbar";
import { apiClient } from "@/lib/api";
import type { MarketItem } from "@/lib/data";
import { marketGames } from "@/lib/data";
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
    priceUSD:
      typeof block.price === "string" ? parseFloat(block.price) : block.price,
    iconURL: block.previews?.[0]?.url,
  };
}

export default async function MarketPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Parse params
  const activeTab = (searchParams.tab as string) || "";
  const query = (searchParams.q as string) || "";
  const sortKey = (searchParams.sort as SortKey) || "name";
  const sortDir = (searchParams.dir as "asc" | "desc") || "asc";
  const page = parseInt((searchParams.page as string) || "1", 10);

  // Fetch data on the server
  const [categoriesRes, blocksRes] = await Promise.all([
    apiClient.GET("/api/v1/categories"),
    apiClient.GET("/api/v1/blocks", {
      query: {
        categorySlug: activeTab || undefined,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
    }),
  ]);

  const categoriesData = categoriesRes.data || [];
  const blocksData = blocksRes.data || [];

  // If no tab provided, use the first category's slug
  const finalActiveTab =
    activeTab || (categoriesData.length > 0 ? categoriesData[0].slug : "");

  const tabs = categoriesData.map((cat) => ({
    value: cat.slug,
    label: cat.name,
  }));

  // Initial processing
  const items = blocksData.map(mapBlockToMarketItem);

  const filteredItems = query.trim()
    ? items.filter((item) =>
        item.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : items;

  const sort: SortState = { key: sortKey, direction: sortDir };
  const sortedItems = sortItems(filteredItems, sort);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const currentPage = page > totalPages ? 1 : page;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedItems = sortedItems.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketNavbar />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <MarketHero />

        <MarketClientWrapper
          initialTab={finalActiveTab}
          initialQuery={query}
          initialSort={sort}
          initialPage={currentPage}
          totalPages={totalPages}
          tabs={tabs}
          items={pagedItems}
          games={marketGames}
        />
      </div>
      <MarketFooter />
    </div>
  );
}
