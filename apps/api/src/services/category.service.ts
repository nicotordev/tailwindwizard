import { prisma } from "../db/prisma.js";

export const categoryService = {
  async listAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async create(data: { name: string; slug: string; icon?: string }) {
    return prisma.category.create({
      data,
    });
  },
};
