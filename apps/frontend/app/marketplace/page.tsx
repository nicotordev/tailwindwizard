import { apiClient } from "@/lib/api";

export default async function MarketPage() {
  const randomBlocks = await apiClient.GET("/api/v1/blocks/random", { parameters: { query: { limit: "10" } } });

  return (
    <div>
      <h1>Marketplace</h1>
      <p>Random blocks: {JSON.stringify(randomBlocks)}</p>
    </div>
  );
}
