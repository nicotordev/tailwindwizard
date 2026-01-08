import { prisma } from "../db/prisma.js";
import type { Prisma } from "../db/generated/prisma/client.js";

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

    // Update Block denormalized ratings
    const aggregations = await prisma.review.aggregate({
      where: { blockId: data.block.connect!.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.block.update({
      where: { id: data.block.connect!.id },
      data: {
        ratingAvg: aggregations._avg.rating || 0,
        ratingCount: aggregations._count.rating || 0,
      },
    });

    return review;
  },
};
