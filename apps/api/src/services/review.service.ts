import type { Prisma } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";

export const reviewService = {
  async findByBlock(blockId: string) {
    return prisma.review.findMany({
      where: { blockId, status: "VISIBLE" },
      include: {
        buyer: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: Prisma.ReviewCreateInput) {
    const review = await prisma.review.create({
      data,
    });

    const blockId = data.block.connect?.id;
    
    if (blockId) {
      // Update Block denormalized ratings
      const aggregations = await prisma.review.aggregate({
        where: { blockId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await prisma.block.update({
        where: { id: blockId },
        data: {
          ratingAvg: aggregations._avg.rating ?? 0,
          ratingCount: aggregations._count.rating,
        },
      });
    }

    return review;
  },
};
