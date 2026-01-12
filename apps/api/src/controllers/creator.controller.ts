import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import { prisma } from "../db/prisma.js";
import { creatorService } from "../services/creator.service.js";
import { userService } from "../services/user.service.js";
import { blockService } from "../services/block.service.js";
import type {
  CreateCreatorInput,
  UpdateCreatorInput,
  CreatorOnboardingInput,
  GetMyBlocksQuery,
  BlockStatus,
  BlockType,
  BlockFramework,
  StylingEngine,
  Visibility,
} from "@tw/shared";
import clerkClient from "../lib/clerkClient.js";

export const creatorController = {
  async getMyBlocks(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const query = c.req.query() as unknown as GetMyBlocksQuery;
    const {
      status,
      type,
      framework,
      stylingEngine,
      visibility,
      q,
      page,
      limit,
    } = query;

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
      include: { creator: true },
    });

    if (!user || !user.creator) {
      return c.json({ message: "Creator profile not found" }, 404);
    }

    const limitNum = limit ? parseInt(limit.toString()) : 20;
    const pageNum = page ? parseInt(page.toString()) : 1;
    const offset = (pageNum - 1) * limitNum;

    const [blocks, total] = await Promise.all([
      blockService.findMany({
        creatorId: user.creator.id,
        status: status as BlockStatus | undefined,
        type: type as BlockType | undefined,
        framework: framework as BlockFramework | undefined,
        stylingEngine: stylingEngine as StylingEngine | undefined,
        visibility: visibility as Visibility | undefined,
        search: q,
        limit: limitNum,
        offset: offset,
      }),
      blockService.countMany({
        creatorId: user.creator.id,
        status: status as BlockStatus | undefined,
        type: type as BlockType | undefined,
        framework: framework as BlockFramework | undefined,
        stylingEngine: stylingEngine as StylingEngine | undefined,
        visibility: visibility as Visibility | undefined,
        search: q,
      }),
    ]);

    return c.json({
      data: blocks,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  },

  async getMe(c: Context) {
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

    const body = await c.req.json<CreateCreatorInput>();
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

    const body = await c.req.json<UpdateCreatorInput>();

    // Check if creator exists first
    const existing = await creatorService.getCreatorByUserId(user.id);
    if (!existing) {
      return c.json({ message: "Creator profile not found" }, 404);
    }

    const updated = await creatorService.updateCreator(user.id, body);
    return c.json(updated);
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    const creator = await creatorService.getCreatorBySlug(id);
    if (!creator) return c.json({ message: "Creator not found" }, 404);
    return c.json(creator);
  },

  async onboardMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const clerkUser = await clerkClient.users.getUser(auth.userId);

    const email = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return c.json({ message: "User email is required for onboarding" }, 400);
    }

    const user = await userService.getOrCreateUser(auth.userId, email);


    if (!user.email) {
      return c.json({ message: "User email is required for onboarding" }, 400);
    }

    const { returnUrl, refreshUrl } =
      await c.req.json<CreatorOnboardingInput>();

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
