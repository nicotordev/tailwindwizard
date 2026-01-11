import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import type {
  BlockStatus,
  Prisma,
  Visibility,
} from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { blockService } from "../services/block.service.js";
import { creatorService } from "../services/creator.service.js";
import { notificationService } from "../services/notification.service.js";

export const blockController = {
  async listRandom(c: Context) {
    const { limit, visibility, creatorId, categorySlug } = c.req.query();

    const limitNum = limit ? parseInt(limit) : 10;

    const blocks = await blockService.findRandom({
      visibility: visibility as Visibility | undefined,
      creatorId: creatorId,
      limit: limitNum,
      categorySlug: categorySlug,
    });

    return c.json(blocks, 200);
  },

  async list(c: Context) {
    const {
      status,
      visibility,
      search,
      limit,
      offset,
      creatorId,
      categorySlug,
    } = c.req.query();

    const limitNum = limit ? parseInt(limit) : 20;
    const offsetNum = offset ? parseInt(offset) : 0;

    const blocks = await blockService.findMany({
      status: status as BlockStatus | undefined,
      visibility: visibility as Visibility | undefined,
      creatorId: creatorId,
      search: search,
      limit: limitNum,
      offset: offsetNum,
      categorySlug: categorySlug,
    });

    return c.json(blocks, 200);
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    const block = await blockService.findById(id);

    if (!block) {
      // Try by slug? Or separate endpoint?
      // Let's assume ID for now.
      return c.json({ message: "Block not found" }, 404);
    }

    // Visibility check could happen here (e.g. if private and not creator)
    // For now we assume public or listing handles it

    return c.json(block);
  },

  async create(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // Resolve internal user
    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (!user) return c.json({ message: "User not found" }, 404);

    // Resolve creator profile
    const creator = await creatorService.getCreatorByUserId(user.id);
    if (!creator) return c.json({ message: "Creator profile required" }, 403);

    const body = await c.req.json();
    const { categoryId, tags, ...rest } = body;

    // Construct Prisma CreateInput
    // We expect body to match specific schema, but we need to connect Creator
    const input: Prisma.BlockCreateInput = {
      ...rest,
      creator: { connect: { id: creator.id } },
      // Defaults
      status: "DRAFT",
    };

    if (categoryId) {
      input.categories = {
        create: {
          categoryId: categoryId,
        },
      };
    }

    if (tags && Array.isArray(tags)) {
      input.tags = {
        create: tags.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { slug: tagName.toLowerCase().replace(/\s+/g, "-") },
              create: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, "-"),
              },
            },
          },
        })),
      };
    }

    const block = await blockService.create(creator.id, input);

    try {
      await notificationService.notifyBlockStatus({
        creatorUserId: creator.userId,
        blockId: block.id,
        blockTitle: block.title,
        status: block.status,
      });
    } catch (notifyError) {
      console.error("Notification dispatch failed:", notifyError);
    }

    return c.json(block, 201);
  },

  async update(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const existing = await blockService.findById(id);
    if (!existing) return c.json({ message: "Block not found" }, 404);

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (!user) return c.json({ message: "User not found" }, 404);

    // Check if user is the creator
    // existing.creatorId must match user's creator profile
    // But we might need to fetch user's creator profile first
    const creator = await creatorService.getCreatorByUserId(user.id);

    if (!creator || creator.id !== existing.creatorId) {
      // Also allow Admin?
      if (user.role !== "ADMIN") {
        return c.json({ message: "Forbidden" }, 403);
      }
    }

    const body = await c.req.json<Prisma.BlockUpdateInput>();
    const previousStatus = existing.status;
    const updated = await blockService.update(id, body);

    if (updated.status !== previousStatus) {
      const creatorUserId = await blockService.getCreatorUserId(updated.id);
      if (creatorUserId) {
        try {
          await notificationService.notifyBlockStatus({
            creatorUserId,
            blockId: updated.id,
            blockTitle: updated.title,
            status: updated.status,
          });
        } catch (notifyError) {
          console.error("Notification dispatch failed:", notifyError);
        }
      }
    }

    return c.json(updated);
  },

  async delete(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const existing = await blockService.findById(id);
    if (!existing) return c.json({ message: "Block not found" }, 404);

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (!user) return c.json({ message: "User not found" }, 404);

    const creator = await creatorService.getCreatorByUserId(user.id);
    if (!creator || creator.id !== existing.creatorId) {
      if (user.role !== "ADMIN") {
        return c.json({ message: "Forbidden" }, 403);
      }
    }

    await blockService.delete(id);
    return c.json({ success: true });
  },
};
