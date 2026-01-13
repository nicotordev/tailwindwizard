import { cartService } from "../services/cart.service.js";
import type { LicenseType } from "../db/generated/prisma/client.js";
import type { Context } from "hono";
import type { User } from "@clerk/backend";

export const getCart = async (c: Context) => {
  const user = c.get("user") as User;
  const cart = await cartService.getCart(user.id);
  return c.json(cart);
};

export const addToCart = async (c: Context) => {
  const user = c.get("user") as User;
  const { blockId, licenseType } = await c.req.json<{
    blockId: string;
    licenseType: LicenseType;
  }>();

  const item = await cartService.addItem(user.id, blockId, licenseType);
  return c.json(item, 201);
};

export const removeFromCart = async (c: Context) => {
  const user = c.get("user") as User;
  const itemId = c.req.param("id");

  await cartService.removeItem(user.id, itemId);
  return c.body(null, 204);
};

export const clearCart = async (c: Context) => {
  const user = c.get("user") as User;
  await cartService.clearCart(user.id);
  return c.body(null, 204);
};
