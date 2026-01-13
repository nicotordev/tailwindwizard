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

  const basePrice = typeof block.price === "string" ? parseFloat(block.price) : (block.price || 29);

  // Pre-generate market data for the "Steam Market" experience
  // In a production app, these trends could be calculated from transaction history
  const marketData = {
    priceHistory: generateHistory(basePrice),
    buyOrders: [
      { price: basePrice * 0.98, quantity: 42 },
      { price: basePrice * 0.95, quantity: 128 },
      { price: basePrice * 0.9, quantity: 512 },
    ],
    sellOrders: [
      { price: basePrice, quantity: 5 },
      { price: basePrice * 1.05, quantity: 12 },
      { price: basePrice * 1.15, quantity: 8 },
    ],
    recentActivity: [
      {
        type: "Market Buy",
        price: basePrice,
        date: "2 minutes ago",
        user: "nicotor",
      },
      {
        type: "Market Buy",
        price: basePrice,
        date: "1 hour ago",
        user: "devdreamer",
      },
      {
        type: "Listing Update",
        price: basePrice,
        date: "3 hours ago",
        user: "creator_elite",
      },
      {
        type: "Market Buy",
        price: basePrice * 0.95,
        date: "Yesterday",
        user: "frontend_wizard",
      },
      {
        type: "Market Buy",
        price: basePrice * 1.02,
        date: "Yesterday",
        user: "lucide_fan",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketNavbar />
      <main className="container max-w-7xl mx-auto px-4 py-12 md:py-20">
        <MarketProductView block={block} marketData={marketData} />
      </main>
      <MarketFooter />
    </div>
  );
}

/**
 * Generates a realistic price history trend for the given base price.
 * Mimics Steam Market price fluctuation.
 */
function generateHistory(basePrice: number) {
  const data = [];
  const now = new Date();
  let currentPrice = basePrice * 0.8; // Start a bit lower

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random walk with slight upward trend
    const change = (Math.random() - 0.45) * (basePrice * 0.05);
    currentPrice += change;

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }
  return data;
}
