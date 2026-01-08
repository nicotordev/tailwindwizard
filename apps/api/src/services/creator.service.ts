import { prisma } from "../db/prisma.js";
import type { Prisma } from "../db/generated/prisma/client.js";

export const creatorService = {
  async getCreatorByUserId(userId: string) {
    return prisma.creator.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async getCreatorBySlug(id: string) {
    return prisma.creator.findUnique({
      where: { id },
      include: {
        user: {
            select: {
                name: true,
                avatarUrl: true
            }
        },
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async createCreator(userId: string, data: Omit<Prisma.CreatorCreateInput, "user">) {
    return prisma.creator.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  },

  async updateCreator(userId: string, data: Prisma.CreatorUpdateInput) {
    return prisma.creator.update({
      where: { userId },
      data,
    });
  },
};
