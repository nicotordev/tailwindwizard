import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import type { ApiKeyScope, Prisma } from "../db/generated/prisma/client.js";
import { userService } from "../services/user.service.js";
import clerkClient from "../lib/clerkClient.js";

export const userController = {
  async getEmailFromClerk(userId: string): Promise<string> {
    try {
      const user = await clerkClient.users.getUser(userId);
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      );
      return (
        primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? ""
      );
    } catch (error) {
      console.error("Failed to fetch user email from Clerk:", error);
      return "";
    }
  },
  async getMe(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const email = await this.getEmailFromClerk(auth.userId);

    if (process.env.ADMIN_EMAILS?.split(",").includes(email)) {
      await clerkClient.users.updateUser(auth.userId, {
        publicMetadata: { role: "ADMIN", onboardingComplete: true },
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

    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

    if (process.env.ADMIN_EMAILS?.split(",").includes(user.email)) {
      await clerkClient.users.updateUser(auth.userId, {
        publicMetadata: { role: "ADMIN", onboardingComplete: true },
      });
    }

    const body = await c.req.json<Prisma.UserUpdateInput>();
    const updated = await userService.updateUser(user.id, body);
    return c.json(updated);
  },

  async getMyPurchases(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

    const purchases = await userService.getUserPurchases(user.id);
    return c.json(purchases);
  },

  async getMyApiKeys(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

    const keys = await userService.getUserApiKeys(user.id);
    return c.json(keys);
  },

  async createApiKey(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

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
    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

    const keyId = c.req.param("id");
    await userService.revokeApiKey(user.id, keyId);
    return c.json({ success: true });
  },

  async createSetupIntent(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

    const result = await userService.createSetupIntent(user.id);
    return c.json(result);
  },

  async finishOnboarding(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ message: "Unauthorized" }, 401);
    }
    const email = await this.getEmailFromClerk(auth.userId);
    const user = await userService.getOrCreateUser(auth.userId, email);

    const body = await c.req.json<{ role: "CREATOR" | "BUILDER" }>();
    const result = await userService.finishOnboarding(user.id, body.role);
    return c.json(result);
  },
};
