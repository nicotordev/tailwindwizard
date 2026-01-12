import { randomBytes, createHash } from "crypto";
import type { Prisma, ApiKeyScope } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { stripe } from "../lib/stripe.js";
import clerkClient from "../lib/clerkClient.js";

export const userService = {
  async getOrCreateUser(externalAuthId: string, email: string) {
    const updateData: Prisma.UserUpdateInput = {
      externalAuthId,
    };

    if (email) {
      updateData.email = email;
    }

    return prisma.user.upsert({
      where: { externalAuthId },
      update: updateData,
      create: {
        externalAuthId,
        email,
        authProvider: "CLERK",
      },
      include: {
        creator: true,
      },
    });
  },

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async getOrCreateStripeCustomer(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: {
        userId: user.id,
        externalAuthId: user.externalAuthId ?? "",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  },

  async createSetupIntent(userId: string) {
    const customerId = await this.getOrCreateStripeCustomer(userId);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return {
      clientSecret: setupIntent.client_secret!,
      customerId,
    };
  },

  async finishOnboarding(userId: string, role: "CREATOR" | "BUILDER") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.externalAuthId) throw new Error("User not found or missing external ID");

    // Fetch current clerk user to preserve existing metadata (like ADMIN role)
    const clerkUser = await clerkClient.users.getUser(user.externalAuthId);
    const existingMetadata = clerkUser.publicMetadata || {};

    // Update Clerk metadata
    await clerkClient.users.updateUser(user.externalAuthId, {
      publicMetadata: {
        ...existingMetadata,
        onboardingComplete: true,
        role: existingMetadata.role || "USER",
        appRole: role.toLowerCase(),
        isCreator: role === "CREATOR",
      },
    });

    return { success: true };
  },

  async getNotificationTarget(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        externalAuthId: true,
        email: true,
      },
    });

    if (!user?.externalAuthId) return null;

    return {
      externalUserId: user.externalAuthId,
      email: user.email,
    };
  },

  async getUserPurchases(userId: string) {
    return prisma.purchase.findMany({
      where: { buyerId: userId },
      include: {
        lineItems: {
          include: {
            block: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getUserApiKeys(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        scope: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  },

  async createApiKey(
    userId: string,
    name: string,
    scope: ApiKeyScope = "READ_PUBLIC"
  ) {
    // Generate a secure random key
    const rawKey = randomBytes(32).toString("hex");
    const prefix = "twz_";
    const key = `${prefix}${rawKey}`;

    // Hash the key for storage
    const keyHash = createHash("sha256").update(key).digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        scope,
        prefix,
        keyHash,
      },
    });

    // Return the full key only once
    return { ...apiKey, key };
  },

  async revokeApiKey(userId: string, keyId: string) {
    return prisma.apiKey.update({
      where: { id: keyId, userId },
      data: { revokedAt: new Date() },
    });
  },
};
