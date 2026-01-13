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
        isApprovedSeller: true,
        approvedAt: new Date(),
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
      const capabilities: Record<string, any> = {
        transfers: { requested: true },
      };

      // card_payments is not supported in some regions like CL
      if (creator.countryCode !== "CL") {
        capabilities.card_payments = { requested: true };
      }

      const accountParams: any = {
        type: "express",
        email: creator.user.email,
        country: creator.countryCode ?? undefined,
        business_profile: {
          url: creator.websiteUrl ?? undefined,
          product_description: creator.bio ?? undefined,
          name: creator.displayName ?? undefined,
        },
        capabilities,
      };

      // Chile (CL) requires a 'recipient' service agreement for cross-border transfers
      if (creator.countryCode === "CL") {
        accountParams.tos_acceptance = {
          service_agreement: "recipient",
        };
      }

      const account = await stripe.accounts.create(accountParams);

      stripeAccountId = account.id;

      await prisma.creator.update({
        where: { id: creator.id },
        data: { stripeAccountId },
      });
    }

    // Create an Account Session for Embedded Onboarding
    const accountSession = await stripe.accountSessions.create({
      account: stripeAccountId,
      components: {
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: true,
          },
        },
      },
    });

    // We still create an account link as a fallback or for hosted redirect if needed
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return { 
      url: accountLink.url,
      clientSecret: accountSession.client_secret 
    };
  },
};
