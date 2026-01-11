import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import { prisma } from "../db/prisma.js";
import { blockService } from "../services/block.service.js";
import type { ModerationDecision } from "../db/generated/prisma/client.js";

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

    if (!user || user.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

    const blocks = await blockService.findMany({
      status: "SUBMITTED",
      limit: 50,
    });

    return c.json(blocks);
  },

  async decide(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });

    if (!user || user.role !== "ADMIN") {
      return c.json({ message: "Forbidden" }, 403);
    }

    const blockId = c.req.param("blockId");
    const body = await c.req.json();
    const { decision, notes } = body as { decision: ModerationDecision; notes?: string };

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
};
