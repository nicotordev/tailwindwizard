import { z } from "@hono/zod-openapi";
import { BlockSchema } from "./block.schema.js";

export const LicenseSchema = z
  .object({
    id: z.string(),
    purchaseId: z.string(),
    buyerId: z.string(),
    blockId: z.string(),
    type: z.enum(["PERSONAL", "TEAM", "ENTERPRISE"]),
    status: z.enum(["ACTIVE", "REVOKED"]),
    deliveryStatus: z.enum(["NOT_READY", "READY", "REVOKED"]),
    createdAt: z.string().or(z.date()),
    block: BlockSchema.optional(),
  })
  .openapi("License");
