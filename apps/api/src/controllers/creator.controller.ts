import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import type { Prisma } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { creatorService } from "../services/creator.service.js";

import { blockService } from "../services/block.service.js";

export const creatorController = {
  async getMyBlocks(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const {
      status,
      type,
      framework,
      stylingEngine,
      visibility,
      q,
      page,
      limit,
    } = c.req.valid("query" as never) as any;

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
      include: { creator: true },
    });

    if (!user || !user.creator) {
      return c.json({ message: "Creator profile not found" }, 404);
    }

    const blocks = await blockService.findMany({
      creatorId: user.creator.id,
      status,
      type,
      framework,
      stylingEngine,
      visibility,
      search: q,
      limit,
      offset: (page - 1) * limit,
    });

    return c.json(blocks);
  },

  async getMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // We assume the user exists in our DB (synced via user.controller or webhooks)
    // But we need to map Clerk ID to our internal User ID
    // Ideally we should have a helper or middleware that attaches the internal User object
    // For now, we query by externalAuthId (Clerk ID) via the User relation,
    // BUT the creator service expects internal userId or we need to adjust it.

    // Let's adjust logic: We need to find the internal user first.
    // Or we can query Creator where user.externalAuthId = auth.userId

    // For simplicity, let's look up the user first.
    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const creator = await creatorService.getCreatorByUserId(user.id);
    if (!creator) {
      return c.json({ message: "Creator profile not found" }, 404);
    }

    return c.json(creator);
  },

  async createMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const existing = await creatorService.getCreatorByUserId(user.id);
    if (existing) {
      return c.json({ message: "Creator profile already exists" }, 409);
    }

    const body = c.req.valid("json" as never) as any;
    const creator = await creatorService.createCreator(user.id, body);
    return c.json(creator, 201);
  },

  async updateMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const body = c.req.valid("json" as never) as any;
    const updated = await creatorService.updateCreator(user.id, body);
    return c.json(updated);
  },

  async getById(c: Context) {
    const { id } = c.req.valid("param" as never) as any;
    const creator = await creatorService.getCreatorBySlug(id);
    if (!creator) return c.json({ message: "Creator not found" }, 404);
    return c.json(creator);
  },

  async onboardMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const { returnUrl, refreshUrl } = c.req.valid("json" as never) as any;

    try {
      const result = await creatorService.onboardCreator(
        user.id,
        returnUrl,
        refreshUrl
      );
      return c.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return c.json({ message: error.message }, 400);
      }
      return c.json({ message: "An unknown error occurred" }, 400);
    }
  },
};
