import type {
  ModerationDecision,
  UserRole,
  Prisma,
  BlockStatus,
} from "../db/generated/prisma/client.js";
import { PurchaseStatus } from "../db/generated/prisma/client.js";
import type { Context } from "hono";

import { prisma } from "../db/prisma.js";
import { blockService } from "../services/block.service.js";
import { categoryService } from "../services/category.service.js";
import { tagService } from "../services/tag.service.js";
import clerkClient from "../lib/clerkClient.js";
import type { User as ClerkUser } from "@clerk/backend";

export const adminController = {
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
    const user = c.get("user") as ClerkUser | null;
    if (!user) return c.json({ message: "Unauthorized" }, 401);

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
            decidedById: user.id,
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
        },
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
    const body = await c.req.json<{
      name: string;
      slug: string;
      icon?: string;
    }>();
    const category = await categoryService.create(body);
    return c.json(category, 201);
  },

  async updateCategory(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json<{
      name?: string;
      slug?: string;
      icon?: string;
    }>();
    const category = await categoryService.update(id, body);
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
    const body = await c.req.json<{ name: string; slug: string }>();
    const tag = await tagService.create(body);
    return c.json(tag, 201);
  },

  async updateTag(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json<{ name?: string; slug?: string }>();
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
