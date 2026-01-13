import { prisma } from "../db/prisma.js";
import type { LicenseType } from "../db/generated/prisma/client.js";
import { HTTPException } from "hono/http-exception";
import type { CartSchema } from "@tw/shared";
import type { z } from "zod";

export class CartService {
  async getCart(userId: string): Promise<z.infer<typeof CartSchema>> {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            block: {
              include: {
                creator: {
                  select: {
                    displayName: true,
                  },
                },
                categories: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              block: true, // Type placeholder, empty initially
            },
          },
        },
      });
      // Re-fetch to match structure if needed or just return empty items
      return { ...cart, items: [] };
    }

    return cart;
  }

  async addItem(userId: string, blockId: string, licenseType: LicenseType) {
    const cart = await this.getCart(userId);

    // Check if item exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_blockId_licenseType: {
          cartId: cart.id,
          blockId,
          licenseType,
        },
      },
    });

    if (existingItem) {
      throw new HTTPException(409, { message: "Item already in cart" });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        blockId,
        licenseType,
      },
      include: {
        block: {
          include: {
            creator: { select: { displayName: true } },
          },
        },
      },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new HTTPException(404, { message: "Cart not found" });

    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (item?.cartId !== cart.id) {
      throw new HTTPException(404, { message: "Item not found in cart" });
    }

    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;

    return prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}

export const cartService = new CartService();
