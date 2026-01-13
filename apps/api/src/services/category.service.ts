import { prisma } from "../db/prisma.js";

export const categoryService = {
  async listAll(options?: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 50, search = "" } = options ?? {};
    const skip = (page - 1) * limit;

    return await prisma.category.findMany({
      where:
        search.trim() !== ""
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
    return await prisma.category.findUnique({
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
    return await prisma.category.create({
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
    return await prisma.category.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  },
};
