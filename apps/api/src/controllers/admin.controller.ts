import type { Context } from "hono";
import type {
  BlockStatus,
  ModerationDecision,
  Prisma,
  UserRole,
} from "../db/generated/prisma/client.js";
import { PurchaseStatus } from "../db/generated/prisma/client.js";

import type { User as ClerkUser } from "@clerk/backend";
import { prisma } from "../db/prisma.js";
import clerkClient from "../lib/clerkClient.js";
import { blockService } from "../services/block.service.js";
import { categoryService } from "../services/category.service.js";
import { tagService } from "../services/tag.service.js";

const parseJsonBody = async <T>(c: Context): Promise<T | null> => {
  const contentLength = c.req.header("content-length");
  if (contentLength && Number(contentLength) === 0) return null;
  try {
    return await c.req.json<T>();
  } catch {
    return null;
  }
};

export const adminController = {
  async getCategoryById(c: Context) {
    const id = c.req.param("id");
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) return c.json({ message: "Category not found" }, 404);
    return c.json(category, 200);
  },

  async listModeration(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const { status, page = "1", limit = "20" } = c.req.query();
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const blockStatus = (status as BlockStatus | undefined) ?? "SUBMITTED";

    const [blocks, total] = await Promise.all([
      blockService.findMany({
        status: blockStatus,
        limit: limitNumber,
        offset: skip,
      }),
      prisma.block.count({
        where: { status: blockStatus },
      }),
    ]);

    return c.json(
      {
        data: blocks,
        meta: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      200
    );
  },

  async decide(c: Context) {
    const authUser = c.get("user") as ClerkUser | null;
    if (!authUser) return c.json({ message: "Unauthorized" }, 401);

    // Resolve internal user
    const internalUser = await prisma.user.findUnique({
      where: { externalAuthId: authUser.id },
    });
    if (!internalUser)
      return c.json({ message: "Admin user not found in DB" }, 404);

    const blockId = c.req.param("blockId");
    const body = await c.req.json<{
      decision: ModerationDecision;
      notes?: string;
    }>();
    const { decision, notes } = body;

    // Update block status
    let newStatus: "APPROVED" | "REJECTED" | "DRAFT" = "DRAFT";
    if (decision === "APPROVE") newStatus = "APPROVED";
    if (decision === "REJECT") newStatus = "REJECTED";
    if (decision === "REQUEST_CHANGES") newStatus = "DRAFT";

    await prisma.block.update({
      where: { id: blockId },
      data: {
        status: newStatus,
        moderationEvents: {
          create: {
            decision,
            notes,
            decidedById: internalUser.id,
          },
        },
      },
    });

    return c.json({ success: true }, 200);
  },

  async listUsers(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const { q, role, page = "1", limit = "20" } = c.req.query();
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.UserWhereInput = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role as UserRole;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return c.json(
      {
        data: users,
        meta: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      200
    );
  },

  async updateUserRole(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const userId = c.req.param("userId");
    const body = await c.req.json<{ role: UserRole }>();
    const { role } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Sync with Clerk
    if (updatedUser.externalAuthId) {
      await clerkClient.users.updateUser(updatedUser.externalAuthId, {
        publicMetadata: {
          role,
          onboardingComplete: true, // If an admin is setting a role, onboarding is effectively complete
        },
      });
    }

    return c.json(updatedUser, 200);
  },

  async banUser(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const userId = c.req.param("userId");
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return c.json({ message: "User not found" }, 404);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true }
    });

    if (dbUser.externalAuthId) {
      await clerkClient.users.banUser(dbUser.externalAuthId);
      const clerkUser = await clerkClient.users.getUser(dbUser.externalAuthId);
      await clerkClient.users.updateUser(dbUser.externalAuthId, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          isBanned: true
        }
      });
    }

    return c.json(updatedUser, 200);
  },

  async unbanUser(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const userId = c.req.param("userId");
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return c.json({ message: "User not found" }, 404);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false }
    });

    if (dbUser.externalAuthId) {
      await clerkClient.users.unbanUser(dbUser.externalAuthId);
      const clerkUser = await clerkClient.users.getUser(dbUser.externalAuthId);
      await clerkClient.users.updateUser(dbUser.externalAuthId, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          isBanned: false
        }
      });
    }

    return c.json(updatedUser, 200);
  },

  async listCreators(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const { status, page = "1", limit = "20" } = c.req.query();
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.CreatorWhereInput = {};
    if (status === "pending") {
      where.isApprovedSeller = false;
      where.stripeAccountStatus = "ENABLED";
    } else if (status === "approved") {
      where.isApprovedSeller = true;
    } else if (status === "rejected") {
      where.rejectedAt = { not: null };
    }

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        include: { user: true },
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creator.count({ where }),
    ]);

    return c.json(
      {
        data: creators,
        meta: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      200
    );
  },

  async reviewCreator(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const creatorId = c.req.param("creatorId");
    const body = await c.req.json<{
      action: "APPROVE" | "REJECT";
      reason?: string;
    }>();
    const { action, reason } = body;

    let data: Prisma.CreatorUpdateInput = {};
    if (action === "APPROVE") {
      data = {
        isApprovedSeller: true,
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      };
    } else {
      data = {
        isApprovedSeller: false,
        rejectedAt: new Date(),
        rejectionReason: reason,
      };
    }

    const updatedCreator = await prisma.creator.update({
      where: { id: creatorId },
      data,
    });

    return c.json(updatedCreator, 200);
  },

  async updateCreator(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const creatorId = c.req.param("creatorId");
    const body = await c.req.json();

    // Sanitize input to only allow profile fields
    const { displayName, bio, websiteUrl, portfolioUrl, countryCode } = body;

    const updatedCreator = await prisma.creator.update({
      where: { id: creatorId },
      data: {
        displayName,
        bio,
        websiteUrl,
        portfolioUrl,
        countryCode,
      },
    });

    return c.json(updatedCreator, 200);
  },

  async banCreator(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const creatorId = c.req.param("creatorId");

    // Fetch creator to get userId
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: { user: true }
    });

    if (!creator) return c.json({ message: "Creator not found" }, 404);

    const updatedCreator = await prisma.creator.update({
      where: { id: creatorId },
      data: { isBanned: true }
    });

    // Ban in our DB
    await prisma.user.update({
      where: { id: creator.userId },
      data: { isBanned: true }
    });

    // Ban in Clerk
    if (creator.user.externalAuthId) {
      await clerkClient.users.banUser(creator.user.externalAuthId);
      const clerkUser = await clerkClient.users.getUser(creator.user.externalAuthId);
      await clerkClient.users.updateUser(creator.user.externalAuthId, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          isBanned: true
        }
      });
    }

    return c.json(updatedCreator, 200);
  },

  async unbanCreator(c: Context) {
    const user = c.get("user");
    if (!user) return c.json({ message: "Unauthorized" }, 401);

    const creatorId = c.req.param("creatorId");

    // Fetch creator to get userId
    const creator = await prisma.creator.findUnique({
      where: { id: creatorId },
      include: { user: true }
    });

    if (!creator) return c.json({ message: "Creator not found" }, 404);

    const updatedCreator = await prisma.creator.update({
      where: { id: creatorId },
      data: { isBanned: false }
    });

    // Unban in our DB
    await prisma.user.update({
      where: { id: creator.userId },
      data: { isBanned: false }
    });

    // Unban in Clerk
    if (creator.user.externalAuthId) {
      await clerkClient.users.unbanUser(creator.user.externalAuthId);
      const clerkUser = await clerkClient.users.getUser(creator.user.externalAuthId);
      await clerkClient.users.updateUser(creator.user.externalAuthId, {
        publicMetadata: {
          ...clerkUser.publicMetadata,
          isBanned: false
        }
      });
    }

    return c.json(updatedCreator, 200);
  },

  // Category Management
  async listCategories(c: Context) {
    const { page, limit, search } = c.req.query();
    const categories = await categoryService.listAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
    return c.json(categories, 200);
  },

  async createCategory(c: Context) {
    const body = await parseJsonBody<{
      name: string;
      slug: string;
      icon?: string;
      iconType?: string;
      description?: string;
      priority?: number;
      isFeatured?: boolean;
    }>(c);
    if (!body) return c.json({ message: "Request body required" }, 400);
    const { name, slug, icon, iconType, description, priority, isFeatured } =
      body;

    const category = await categoryService.create({
      name,
      slug,
      icon,
      iconType,
      description,
      priority: priority ? Number(priority) : 0,
      isFeatured: !!isFeatured,
    });

    return c.json(category, 201);
  },

  async updateCategory(c: Context) {
    const id = c.req.param("id");
    const body = await parseJsonBody<{
      name?: string;
      slug?: string;
      icon?: string;
      iconType?: string;
      description?: string;
      priority?: number;
      isFeatured?: boolean;
    }>(c);
    if (!body) return c.json({ message: "Request body required" }, 400);
    const { name, slug, icon, iconType, description, priority, isFeatured } =
      body;

    const category = await categoryService.update(id, {
      name,
      slug,
      icon,
      iconType,
      description,
      priority: priority !== undefined ? Number(priority) : undefined,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
    });

    return c.json(category, 200);
  },

  async deleteCategory(c: Context) {
    const id = c.req.param("id");
    await categoryService.delete(id);
    return c.json({ success: true }, 200);
  },

  // Tag Management
  async listTags(c: Context) {
    const tags = await tagService.listAll();
    return c.json(tags, 200);
  },

  async createTag(c: Context) {
    const body = await parseJsonBody<{
      name: string;
      slug: string;
      icon?: string;
      iconType?: string;
      description?: string;
    }>(c);
    if (!body) return c.json({ message: "Request body required" }, 400);
    const tag = await tagService.create(body);
    return c.json(tag, 201);
  },

  async updateTag(c: Context) {
    const id = c.req.param("id");
    const body = await parseJsonBody<{
      name?: string;
      slug?: string;
      icon?: string;
      iconType?: string;
      description?: string;
    }>(c);
    if (!body) return c.json({ message: "Request body required" }, 400);
    const tag = await tagService.update(id, body);
    return c.json(tag, 200);
  },

  async deleteTag(c: Context) {
    const id = c.req.param("id");

    await tagService.delete(id);

    return c.json({ success: true }, 200);
  },

  // Finance / Commerce Management

  async listPurchases(c: Context) {
    const { page = "1", limit = "20", status } = c.req.query();

    const pageNumber = parseInt(page, 10);

    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.PurchaseWhereInput = {};

    if (status) {
      where.status =
        status in PurchaseStatus
          ? PurchaseStatus[status as keyof typeof PurchaseStatus]
          : PurchaseStatus.PAID;
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,

        include: {
          buyer: {
            select: {
              id: true,

              name: true,

              email: true,

              avatarUrl: true,
            },
          },

          lineItems: {
            include: {
              block: {
                select: {
                  id: true,
                  screenshot: true,
                  title: true,

                  slug: true,
                },
              },
            },
          },
        },

        skip,

        take: limitNumber,

        orderBy: { createdAt: "desc" },
      }),

      prisma.purchase.count({ where }),
    ]);

    return c.json(
      {
        data: purchases,

        meta: {
          total,

          page: pageNumber,

          limit: limitNumber,

          totalPages: Math.ceil(total / limitNumber),
        },
      },
      200
    );
  },

  async getWebhookStats(c: Context) {
    // Last 24 hours stats

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, failed, pending, lastEvents] = await Promise.all([
      prisma.webhookEvent.count({
        where: { receivedAt: { gte: twentyFourHoursAgo } },
      }),

      prisma.webhookEvent.count({
        where: {
          receivedAt: { gte: twentyFourHoursAgo },

          status: "FAILED",
        },
      }),

      prisma.webhookEvent.count({
        where: {
          receivedAt: { gte: twentyFourHoursAgo },

          status: "RECEIVED",
        },
      }),

      prisma.webhookEvent.findMany({
        take: 10,

        orderBy: { receivedAt: "desc" },
      }),
    ]);

    return c.json(
      {
        last24h: {
          total,

          failed,

          pending,

          successRate: total > 0 ? ((total - failed) / total) * 100 : 100,
        },

        lastEvents,
      },
      200
    );
  },

  async getDashboardStats(c: Context) {
    const [pendingBlocks, totalCreators, totalRevenue] = await Promise.all([
      prisma.block.count({ where: { status: "SUBMITTED" } }),

      prisma.creator.count({ where: { isApprovedSeller: true } }),

      prisma.purchase.aggregate({
        where: { status: "PAID" },

        _sum: { totalAmount: true },
      }),
    ]);

    return c.json(
      {
        pendingBlocks,

        totalCreators,

        totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
      },
      200
    );
  },
};
