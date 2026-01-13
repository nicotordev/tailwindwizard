import { z } from "zod";
import { BlockSchema } from "./block.schema.js";

export const CartItemSchema = z.object({
  id: z.string().cuid(),
  cartId: z.string().cuid(),
  blockId: z.string().cuid(),
  licenseType: z.enum(["PERSONAL", "TEAM", "ENTERPRISE"]),
  createdAt: z.string().or(z.date()),
  block: BlockSchema.optional(), // Populated in response
});

export const CartSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  items: z.array(CartItemSchema),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const AddToCartSchema = z.object({
  blockId: z.string().cuid(),
  licenseType: z.enum(["PERSONAL", "TEAM", "ENTERPRISE"]).default("PERSONAL"),
});
