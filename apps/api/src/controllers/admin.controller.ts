import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import type {
  ModerationDecision,
  UserRole,
  Prisma,
  BlockStatus,
} from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { blockService } from "../services/block.service.js";

export const adminController = {
  async listModeration(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (user?.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

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

    return c.json({
      data: blocks,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  },

  async decide(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (user?.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

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
    if (decision === "REQUEST_CHANGES") newStatus = "DRAFT"; // Or REJECTED depending on logic

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

    return c.json({ success: true });
  },

  async listUsers(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const currentUser = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (currentUser?.role !== "ADMIN")
      return c.json({ message: "Forbidden" }, 403);

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

    return c.json({
      data: users,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  },

  async updateUserRole(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const currentUser = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (currentUser?.role !== "ADMIN")
      return c.json({ message: "Forbidden" }, 403);

    const userId = c.req.param("userId");
    const body = await c.req.json<{ role: UserRole }>();
    const { role } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return c.json(updatedUser);
  },

  async listCreators(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const currentUser = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (currentUser?.role !== "ADMIN")
      return c.json({ message: "Forbidden" }, 403);

    const { status, page = "1", limit = "20" } = c.req.query();
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.CreatorWhereInput = {};
    if (status === "pending") {
      where.isApprovedSeller = false;
      where.stripeAccountStatus = "ENABLED"; // Assuming they need stripe enabled to be approved
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

    return c.json({
      data: creators,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  },

  async reviewCreator(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const currentUser = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (currentUser?.role !== "ADMIN")
      return c.json({ message: "Forbidden" }, 403);

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

    return c.json(updatedCreator);
  },
};
