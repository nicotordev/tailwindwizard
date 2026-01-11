import { components } from "./api";

export type PurchaseDetailResponse = components["schemas"]["Purchase"] & {
  id: string;
  status: string;
  totalAmount: number | string;
  currency: string;
};
