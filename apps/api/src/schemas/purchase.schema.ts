import { z } from "@hono/zod-openapi";
import { LicenseType } from "../db/generated/prisma/client.js";

const LICENSE_TYPE_VALUES = Object.values(LicenseType) as [
  LicenseType,
  ...LicenseType[],
];
const LicenseTypeEnum = z.enum(LICENSE_TYPE_VALUES);

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
    blockIds: z.array(z.string().min(1)).min(1),
    licenseType: LicenseTypeEnum.default(LICENSE_TYPE_VALUES[0]),
  })
  .openapi("CreateCheckout");

export const CheckoutResponseSchema = z
  .object({
    purchase: PurchaseSchema,
    checkoutUrl: z.string(),
  })
  .openapi("CheckoutResponse");

export const LicenseListSchema = z
  .object({
    blockId: z.string(),
    licenseKey: z.string(),
    licenseType: LicenseTypeEnum,
    issuedAt: z.string().or(z.date()),
    expiresAt: z.string().or(z.date()).nullable(),
  })
  .openapi("LicenseList");
