import { prisma } from "../db/prisma.js";

export const categoryService = {
  async listAll(options?: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 50, search } = options ?? {};
    const skip = (page - 1) * limit;

    return prisma.category.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { name: "asc" },
      take: limit,
      skip,
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

  async create(data: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    priority?: number;
    isFeatured?: boolean;
  }) {
    return prisma.category.create({
      data,
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      icon?: string;
      description?: string;
      priority?: number;
      isFeatured?: boolean;
    }
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },
};