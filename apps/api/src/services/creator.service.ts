import type { Prisma } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { stripe } from "../lib/stripe.js";

export const creatorService = {
  async getCreatorByUserId(userId: string) {
    return prisma.creator.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async getCreatorBySlug(id: string) {
    return prisma.creator.findUnique({
      where: { id },
      include: {
        user: {
            select: {
                name: true,
                avatarUrl: true
            }
        },
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async createCreator(userId: string, data: Omit<Prisma.CreatorCreateInput, "user">) {
    return prisma.creator.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  },

  async updateCreator(userId: string, data: Prisma.CreatorUpdateInput) {
    return prisma.creator.update({
      where: { userId },
      data,
    });
  },

  async onboardCreator(userId: string, returnUrl: string, refreshUrl: string) {
    const creator = await prisma.creator.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!creator) {
      throw new Error("Creator not found");
    }

    let stripeAccountId = creator.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: creator.user.email,
        country: creator.countryCode || undefined,
        business_profile: {
          url: creator.websiteUrl || undefined,
          product_description: creator.bio || undefined,
          name: creator.displayName || undefined,
        },
        settings: {
          dashboard: {
            display_name: creator.displayName || undefined,
          },
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      await prisma.creator.update({
        where: { id: creator.id },
        data: { stripeAccountId },
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  },
};
