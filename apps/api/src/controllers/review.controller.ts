import type { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { reviewService } from "../services/review.service.js";
import { prisma } from "../db/prisma.js";

export const reviewController = {
  async listByBlock(c: Context) {
    const blockId = c.req.param("id");
    const reviews = await reviewService.findByBlock(blockId);
    return c.json(reviews, 200);
  },

  async create(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const blockId = c.req.param("id");
    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (!user) return c.json({ message: "User not found" }, 404);

    // Verify if user already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        blockId_buyerId: {
          blockId,
          buyerId: user.id,
        },
      },
    });
    if (existing) return c.json({ message: "Already reviewed" }, 409);

    // Optional: Verify if user actually purchased the block
    const hasPurchase = await prisma.purchase.findFirst({
        where: {
            buyerId: user.id,
            lineItems: {
                some: { blockId }
            },
            status: 'PAID'
        }
    });
    
    // For now, we allow reviewing if we want, or strictly enforce purchase
    // if (!hasPurchase) return c.json({ message: "Purchase required to review" }, 403);

    const body = await c.req.json();
    const review = await reviewService.create({
      rating: body.rating,
      title: body.title,
      body: body.body,
      block: { connect: { id: blockId } },
      buyer: { connect: { id: user.id } },
      // Link to purchase if found
      purchase: hasPurchase ? { connect: { id: hasPurchase.id } } : undefined
    });

    return c.json(review, 201);
  },
};
