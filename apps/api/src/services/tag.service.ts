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

  async create(data: { name: string; slug: string }) {
    return prisma.tag.create({
      data,
    });
  },

  async update(id: string, data: { name?: string; slug?: string }) {
    return prisma.tag.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.tag.delete({
      where: { id },
    });
  },
};
