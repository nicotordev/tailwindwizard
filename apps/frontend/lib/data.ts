export type MarketTabKey = "economia" | "zero-trust" | "stripe";

export type MarketItem = {
  id: string;
  name: string;
  game: string;
  quantity: number;
  priceUSD: number;
  iconURL?: string;
};

export const marketTabs = [
  { value: "economia" as const, label: "Economia de Bloques" },
  { value: "zero-trust" as const, label: "Zero Trust Preview" },
  { value: "stripe" as const, label: "Stripe Connect" },
];

export const marketData: Record<MarketTabKey, MarketItem[]> = {
  economia: [
    { id: "eco-1", name: "Bento Analytics Grid", game: "Fintech", quantity: 142, priceUSD: 28 },
    { id: "eco-2", name: "SaaS Onboarding Flow", game: "SaaS", quantity: 87, priceUSD: 34 },
    { id: "eco-3", name: "Marketplace Trust Panel", game: "Marketplaces", quantity: 64, priceUSD: 42 },
    { id: "eco-4", name: "Control de Versiones", game: "DevTools", quantity: 19, priceUSD: 18 },
    { id: "eco-5", name: "Catalogo de Bloques", game: "Catalog", quantity: 54, priceUSD: 26 },
  ],
  "zero-trust": [
    { id: "zt-1", name: "Playwright Snapshot Worker", game: "Security", quantity: 24, priceUSD: 55 },
    { id: "zt-2", name: "Preview Watermark Kit", game: "Security", quantity: 63, priceUSD: 31 },
    { id: "zt-3", name: "Render Queue Monitor", game: "Infra", quantity: 48, priceUSD: 36 },
    { id: "zt-4", name: "Zero Trust Audit Log", game: "Compliance", quantity: 72, priceUSD: 40 },
  ],
  stripe: [
    { id: "st-1", name: "Connect Express Onboarding", game: "Payments", quantity: 96, priceUSD: 48 },
    { id: "st-2", name: "Payout Calendar", game: "Payments", quantity: 53, priceUSD: 29 },
    { id: "st-3", name: "Split Fee Simulator", game: "Finance", quantity: 21, priceUSD: 24 },
    { id: "st-4", name: "KYC Status Tracker", game: "Compliance", quantity: 67, priceUSD: 39 },
  ],
};

export const marketGames = ["Fintech", "SaaS", "Marketplaces", "DevTools", "Security", "Compliance"];
