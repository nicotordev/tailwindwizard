import { MarketFooter } from "@/components/footer";
import { MarketProductView } from "@/components/marketplace/market-product-view";
import { MarketNavbar } from "@/components/navbar";
import { apiClient } from "@/lib/api";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BlockMarketPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch block data from API
  const { data: block, error } = await apiClient.GET("/api/v1/blocks/{id}", {
    params: {
      path: { id },
    },
  });

  if (error || !block) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketNavbar />
      <main className="container max-w-7xl mx-auto px-4 py-12 md:py-20">
        <MarketProductView block={block} />
      </main>
      <MarketFooter />
    </div>
  );
}
