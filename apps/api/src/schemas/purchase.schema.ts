import { z } from "@hono/zod-openapi";

export const PurchaseSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    totalAmount: z.number().or(z.string()),
    currency: z.string(),
  })
  .openapi("Purchase");

export const CreateCheckoutSchema = z
  .object({
    blockIds: z.array(z.string()),
    licenseType: z.enum(["PERSONAL", "TEAM", "ENTERPRISE"]).default("PERSONAL"),
  })
  .openapi("CreateCheckout");

export const CheckoutResponseSchema = z
  .object({
    purchase: PurchaseSchema,
    checkoutUrl: z.string(),
  })
  .openapi("CheckoutResponse");
