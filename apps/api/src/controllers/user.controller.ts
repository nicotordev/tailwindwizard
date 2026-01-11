import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import type { ApiKeyScope, Prisma } from "../db/generated/prisma/client.js";
import { userService } from "../services/user.service.js";
import clerkClient from "../lib/clerkClient.js";

export const userController = {
  async getMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    // In a real app, email would come from session claims or a separate Clerk API call if not in DB
    // For now, we assume if it's the first time, we might fail or need email from token
    // But let's assume the user exists or we can get email from claims if configured in Clerk
    const email = (auth.sessionClaims.email as string) || "";

    if (process.env.ADMIN_EMAILS?.split(",").includes(email)) {
      await clerkClient.users.updateUser(auth.userId, {
        publicMetadata: { role: "admin" },
      });
    }

    // We use upsert to ensure we have a local record
    const user = await userService.getOrCreateUser(auth.userId, email);
    return c.json(user);
  },

  async updateMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const user = await userService.getOrCreateUser(auth.userId, "");

    const body = await c.req.json<Prisma.UserUpdateInput>();
    const updated = await userService.updateUser(user.id, body);
    return c.json(updated);
  },

  async getMyPurchases(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const user = await userService.getOrCreateUser(auth.userId, "");

    const purchases = await userService.getUserPurchases(user.id);
    return c.json(purchases);
  },

  async getMyApiKeys(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const user = await userService.getOrCreateUser(auth.userId, "");

    const keys = await userService.getUserApiKeys(user.id);
    return c.json(keys);
  },

  async createApiKey(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const user = await userService.getOrCreateUser(auth.userId, "");

    const body = await c.req.json<{ name: string; scope: string }>();
    const { name, scope } = body;

    const result = await userService.createApiKey(
      user.id,
      name,
      scope as ApiKeyScope
    );
    return c.json(result, 201);
  },

  async revokeApiKey(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const user = await userService.getOrCreateUser(auth.userId, "");

    const keyId = c.req.param("id");
    await userService.revokeApiKey(user.id, keyId);
    return c.json({ success: true });
  },
};
