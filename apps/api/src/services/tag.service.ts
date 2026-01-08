import { prisma } from "../db/prisma.js";

export const tagService = {
  async listAll() {
    return prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.tag.findUnique({
      where: { slug },
    });
  },
};
