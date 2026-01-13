import { MarketFooter } from "@/components/footer";
import { type SortKey, type SortState } from "@/components/item-table";
import { MarketClientWrapper } from "@/components/market-client-wrapper";
import { MarketHero } from "@/components/market-hero";
import { MarketNavbar } from "@/components/navbar";
import { apiClient } from "@/lib/api";
import type { MarketItem } from "@/lib/data";
import { marketGames } from "@/lib/data";

const PAGE_SIZE = 8;

export default async function MarketPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const activeTab = (searchParams.tab as string) || "activity";
  const query = (searchParams.q as string) || "";
  const sortKey =
    (searchParams.sort as SortKey) ||
    (activeTab === "most-sold" ? "quantity" : "name");
  const sortDir =
    (searchParams.dir as "asc" | "desc") ||
    (activeTab === "most-sold" ? "desc" : "asc");
  const page = parseInt((searchParams.page as string) || "1", 10);

  // Fetch data on the server
  const [blocksRes, purchasesRes] = await Promise.all([
    apiClient.GET("/api/v1/blocks", {
      query: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
    }),
    activeTab === "activity"
      ? apiClient.GET("/api/v1/users/me/purchases")
      : Promise.resolve({ data: [] }),
  ]);

  const blocksData = blocksRes.data || [];
  const purchasesData = purchasesRes.data || [];
  const blocksById = new Map(blocksData.map((block) => [block.id, block]));

  let marketItems: MarketItem[] = [];

  if (activeTab === "activity") {
    // Latest Activity shows purchases
    marketItems = purchasesData.map((p) => {
      const lineItem = p.lineItems?.[0];
      const blockId = lineItem?.block?.id;
      const block = blockId ? blocksById.get(blockId) : undefined;
      return {
        id: p.id,
        blockId,
        screenshot: block?.screenshot,
        name: lineItem?.block?.title || "Unknown Block",
        game: "Template",
        quantity: 1,
        priceUSD:
          typeof p.totalAmount === "string"
            ? parseFloat(p.totalAmount)
            : p.totalAmount,
        actionType: "sold", // Every activity is a successful sale
        timestamp: p.createdAt,
        details: "Standard License",
      };
    });
  } else {
    // Most Sold shows blocks sorted by soldCount
    marketItems = blocksData
      .filter((b) => (b.soldCount || 0) > 0)
      .map((b) => ({
        id: b.id,
        blockId: b.id,
        screenshot: b.screenshot,
        name: b.title,
        game: b.categories?.[0]?.category?.name || "General",
        quantity: b.soldCount || 0,
        priceUSD: typeof b.price === "string" ? parseFloat(b.price) : b.price,
        details: `${b.soldCount} sales total`,
        actionType: "sold",
      }));
  }

  // Filter if search query exists
  if (query.trim()) {
    marketItems = marketItems.filter((item) =>
      item.name.toLowerCase().includes(query.trim().toLowerCase())
    );
  }

  // Sorting
  marketItems.sort((a, b) => {
    const direction = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * direction;
    if (sortKey === "quantity") return (a.quantity - b.quantity) * direction;
    if (sortKey === "price") return (a.priceUSD - b.priceUSD) * direction;
    return 0;
  });

  // Latest Activity defaults to newest first if no sort specified
  if (activeTab === "activity" && !searchParams.sort) {
    marketItems.sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    );
  }

  const totalPages = Math.max(1, Math.ceil(marketItems.length / PAGE_SIZE));
  const currentPage = page > totalPages ? 1 : page;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedItems = marketItems.slice(start, start + PAGE_SIZE);

  const sort: SortState = { key: sortKey, direction: sortDir };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketNavbar />
      <div className="mx-auto flex w-full max-w-360 flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <MarketHero />

        <MarketClientWrapper
          initialTab={activeTab}
          initialQuery={query}
          initialSort={sort}
          initialPage={currentPage}
          totalPages={totalPages}
          items={pagedItems}
          games={marketGames}
        />
      </div>
      <MarketFooter />
    </div>
  );
}
