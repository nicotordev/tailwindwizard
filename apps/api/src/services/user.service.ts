import type { Prisma, ApiKeyScope } from "../db/generated/prisma/client.js";
import { randomBytes, createHash } from "crypto";
import { prisma } from "../db/prisma.js";

export const userService = {
  async getOrCreateUser(externalAuthId: string, email: string) {
    return prisma.user.upsert({
      where: { externalAuthId },
      update: {},
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

  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { creator: true },
    });
  },

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
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
