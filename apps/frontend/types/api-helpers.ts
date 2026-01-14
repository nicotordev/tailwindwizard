import type { components, paths } from "./api";

export type PurchaseDetailResponse = components["schemas"]["Purchase"] & {
  id: string;
  status: string;
  totalAmount: number | string;
  currency: string;
};

export type AdminPurchaseListResponse =
  paths["/api/v1/admin/purchases"]["get"]["responses"][200]["content"]["application/json"];
export type AdminWebhookStatsResponse =
  paths["/api/v1/admin/finance/webhooks"]["get"]["responses"][200]["content"]["application/json"];
export type AdminStatsResponse =
  paths["/api/v1/admin/stats"]["get"]["responses"][200]["content"]["application/json"];

type AdminPurchaseLineItemBase =
  NonNullable<AdminPurchaseListResponse["data"][number]["lineItems"]>[number];
export type AdminPurchaseLineItem = AdminPurchaseLineItemBase & {
  licenseType?: "PERSONAL" | "TEAM" | "ENTERPRISE";
};

export type AdminPurchase = Omit<
  AdminPurchaseListResponse["data"][number],
  "lineItems"
> & {
  lineItems?: AdminPurchaseLineItem[];
};
export type WebhookEvent = components["schemas"]["WebhookEvent"];
