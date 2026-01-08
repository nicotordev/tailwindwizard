import type {
  BlockStatus,
  Prisma,
  Visibility,
} from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";

export const blockService = {
  async findMany(params: {
    status?: BlockStatus;
    visibility?: Visibility;
    creatorId?: string;
    limit?: number;
    offset?: number;
    search?: string;
    categorySlug?: string;
  }) {
    const {
      status,
      visibility,
      creatorId,
      limit = 20,
      offset = 0,
      search,
      categorySlug,
    } = params;

    const where: Prisma.BlockWhereInput = {
      status,
      visibility,
      creatorId,
      // Search by title or description
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
      categories: categorySlug
        ? {
            some: {
              category: {
                slug: categorySlug,
              },
            },
          }
        : undefined,
    };

    return prisma.block.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        creator: {
          select: {
            displayName: true,
            user: { select: { avatarUrl: true } },
          },
        },
        previews: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.block.findUnique({
      where: { id },
      include: {
        creator: {
          include: { user: { select: { avatarUrl: true, name: true } } },
        },
        previews: true,
        registryDeps: true,
        npmDeps: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        _count: {
          select: { reviews: true },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.block.findUnique({
      where: { slug },
      include: {
        creator: {
          include: { user: { select: { avatarUrl: true, name: true } } },
        },
        previews: true,

        registryDeps: true,
        npmDeps: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        _count: {
          select: { reviews: true },
        },
      },
    });
  },

  async create(creatorId: string, data: Prisma.BlockCreateInput) {
    // Note: data.creator needs to be handled by the caller or passed structurally
    // But typically we pass the relation connect in the controller
    return prisma.block.create({
      data,
    });
  },

  async update(id: string, data: Prisma.BlockUpdateInput) {
    return prisma.block.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.block.delete({
      where: { id },
    });
  },
};
