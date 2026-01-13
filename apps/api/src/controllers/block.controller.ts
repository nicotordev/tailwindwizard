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

const toTagSlug = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-");

const buildTagCreates = (tags: string[]) =>
  tags.map((tagName) => ({
    tag: {
      connectOrCreate: {
        where: { slug: toTagSlug(tagName) },
        create: {
          name: tagName,
          slug: toTagSlug(tagName),
        },
      },
    },
  }));

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
        create: buildTagCreates(tags as string[]),
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

  async uploadBundle(c: Context) {
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
    const isOwner = creator?.id === existing.creatorId;

    if (!isOwner && user.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

    if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
      return c.json(
        { message: "Bundle uploads are only allowed for drafts." },
        409
      );
    }

    const body = await c.req.parseBody();
    const rawBundle = body.bundle ?? body.file ?? body.upload;
    const bundle = Array.isArray(rawBundle) ? rawBundle[0] : rawBundle;

    if (!(bundle instanceof File)) {
      return c.json({ message: "Bundle file is required." }, 400);
    }

    const arrayBuffer = await bundle.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.byteLength) {
      return c.json({ message: "Bundle file is empty." }, 400);
    }

    const upload = await blockService.upsertCodeBundle({
      blockId: existing.id,
      fileName: bundle.name,
      buffer,
    });

    void blockService.queueRenderJobIfNeeded(existing.id, { force: true });

    return c.json(
      {
        id: upload.id,
        fileName: bundle.name,
        sha256: upload.sha256,
        size: upload.size,
      },
      201
    );
  },

  async queuePreview(c: Context) {
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
    const isOwner = creator?.id === existing.creatorId;

    if (!isOwner && user.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

    if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
      return c.json(
        { message: "Preview renders are only allowed for drafts." },
        409
      );
    }

    const codeBundle = await prisma.codeBundle.findUnique({
      where: { blockId: existing.id },
      select: { id: true },
    });

    if (!codeBundle) {
      return c.json(
        { message: "Upload a bundle before generating previews." },
        400
      );
    }

    const renderJob = await blockService.queueRenderJob(existing.id);
    return c.json(renderJob, 201);
  },

  async getRenderJobStatus(c: Context) {
    const jobId = c.req.param("jobId");
    const renderJob = await prisma.renderJob.findUnique({
      where: { id: jobId },
    });

    if (!renderJob) {
      return c.json({ message: "Render job not found" }, 404);
    }

    return c.json(renderJob);
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

    const body = await c.req.json();
    const { categoryId, tags, ...rest } = body as Prisma.BlockUpdateInput & {
      categoryId?: string;
      tags?: string[];
    };

    const input: Prisma.BlockUpdateInput = { ...rest };

    if (categoryId) {
      input.categories = {
        deleteMany: {},
        create: { categoryId },
      };
    }

    if (Array.isArray(tags)) {
      input.tags = {
        deleteMany: {},
        create: buildTagCreates(tags),
      };
    }
    const previousStatus = existing.status;
    const updated = await blockService.update(id, input);

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

  async submit(c: Context) {
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
    const isOwner = creator?.id === existing.creatorId;

    if (!isOwner && user.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

    if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
      return c.json({ message: "Block is already submitted." }, 409);
    }

    const codeBundle = await prisma.codeBundle.findUnique({
      where: { blockId: existing.id },
      select: { id: true },
    });

    if (!codeBundle) {
      return c.json({ message: "Upload a bundle before submitting." }, 400);
    }

    const [renderJobCount, previewCount] = await Promise.all([
      prisma.renderJob.count({ where: { blockId: existing.id } }),
      prisma.previewAsset.count({ where: { blockId: existing.id } }),
    ]);

    if (renderJobCount === 0 && previewCount === 0) {
      return c.json(
        { message: "Queue a preview render before submitting." },
        400
      );
    }

    const updated = await blockService.update(id, { status: "SUBMITTED" });

    try {
      await notificationService.notifyBlockStatus({
        creatorUserId: existing.creator.userId,
        blockId: updated.id,
        blockTitle: updated.title,
        status: updated.status,
      });
    } catch (notifyError) {
      console.error("Notification dispatch failed:", notifyError);
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
