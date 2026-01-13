import { MarketFooter } from "@/components/footer";
import { type SortKey, type SortState } from "@/components/item-table";
import { MarketClientWrapper } from "@/components/market-client-wrapper";
import { MarketHero } from "@/components/market-hero";
import { MarketNavbar } from "@/components/navbar";
import { apiClient } from "@/lib/api";
import type { MarketItem } from "@/lib/data";

const PAGE_SIZE = 8;
const DEFAULT_CATEGORY = "General";

type PreviewItem = {
  viewport: "MOBILE" | "TABLET" | "DESKTOP";
  url: string;
};

type BlockPreviewSource = {
  screenshot?: string | null;
  previews?: PreviewItem[];
  categories?: { category?: { name?: string | null } | null }[] | null;
  type?: string;
  title?: string;
};

const getPrimaryCategory = (block?: BlockPreviewSource) =>
  block?.categories?.[0]?.category?.name || DEFAULT_CATEGORY;

const getPreviewUrl = (block?: BlockPreviewSource) =>
  block?.previews?.find((preview) => preview.viewport === "DESKTOP")?.url ||
  block?.screenshot ||
  null;

export default async function MarketPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const allowedTabs = new Set(["activity", "most-sold", "all-blocks"]);
  const requestedTab = (searchParams.tab as string) || "all-blocks";
  const activeTab = allowedTabs.has(requestedTab) ? requestedTab : "all-blocks";
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
  const marketCategories = Array.from(
    new Set(
      blocksData
        .map((block) => getPrimaryCategory(block))
        .filter((category) => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b));

  let marketItems: MarketItem[] = [];

  if (activeTab === "activity") {
    // Latest Activity shows purchases
    marketItems = purchasesData.map((p) => {
      const lineItem = p.lineItems?.[0];
      const blockId = lineItem?.block?.id;
      const block = blockId ? blocksById.get(blockId) : undefined;
      const categoryName = getPrimaryCategory(block);
      const preview =
        getPreviewUrl(block) || lineItem?.block?.screenshot || null;
      return {
        id: p.id,
        blockId,
        screenshot: preview,
        name: block?.title || lineItem?.block?.title || "Unknown Block",
        game: categoryName,
        quantity: 1,
        priceUSD:
          typeof p.totalAmount === "string"
            ? parseFloat(p.totalAmount)
            : p.totalAmount,
        actionType: "sold", // Every activity is a successful sale
        timestamp: p.createdAt,
        details: `${categoryName} | ${block?.type || "COMPONENT"}`,
      };
    });
  } else if (activeTab === "most-sold") {
    // Most Sold shows blocks sorted by soldCount
    marketItems = blocksData
      .filter((b) => (b.soldCount || 0) > 0)
      .map((b) => {
        const categoryName = getPrimaryCategory(b);
        const preview = getPreviewUrl(b);
        const soldCount = b.soldCount || 0;

        return {
          id: b.id,
          blockId: b.id,
          screenshot: preview,
          name: b.title,
          game: categoryName,
          quantity: soldCount,
          priceUSD: typeof b.price === "string" ? parseFloat(b.price) : b.price,
          details: `${categoryName} | ${soldCount} sales`,
          actionType: "sold",
        };
      });
  } else {
    // All Blocks shows the full catalog
    marketItems = blocksData.map((b) => {
      const category = getPrimaryCategory(b);
      const preview = getPreviewUrl(b);
      const soldCount = b.soldCount || 0;

      return {
        id: b.id,
        blockId: b.id,
        screenshot: preview,
        name: b.title,
        game: category,
        quantity: soldCount,
        priceUSD: typeof b.price === "string" ? parseFloat(b.price) : b.price,
        details:
          soldCount > 0
            ? `${category} | ${soldCount} sales`
            : `${category} | New`,
      };
    });
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
          games={marketCategories}
        />
      </div>
      <MarketFooter />
    </div>
  );
}
