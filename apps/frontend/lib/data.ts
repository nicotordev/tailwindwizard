export type MarketItem = {
  id: string;
  blockId?: string;
  name: string;
  game: string;
  quantity: number;
  priceUSD: number;
  screenshot?: string | null;
  details?: string;
  actionType?: "bought" | "sold";
  timestamp?: string;
};

export const marketGames = [
  "SaaS",
  "Fintech",
  "E-commerce",
  "AI/ML",
  "DevTools",
  "Dashboards",
];
