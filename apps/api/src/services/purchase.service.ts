// src/services/purchase.service.ts
import { randomBytes } from "crypto";
import env from "../config/env.config.js";
import { Prisma } from "../db/generated/prisma/client.js";
import type { LicenseType } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import stripe from "../lib/stripe.js";
import { calcPlatformFeeCents, fromCents, toCents } from "../utils/money.js";

interface CreatePendingPurchaseResult {
  purchaseId: string;
  checkoutUrl: string;
}

export const purchaseService = {
  /**
   * Crea Purchase=PENDING y genera Stripe Checkout Session.
   * Restricción: todos los blocks deben pertenecer al MISMO creator (Checkout no hace multi-split “bonito”).
   */
  async createPendingPurchase(
    userId: string,
    blockIds: string[],
    licenseType: LicenseType = "PERSONAL"
  ): Promise<CreatePendingPurchaseResult> {
    if (blockIds.length === 0) throw new Error("No blockIds provided");

    const buyer = await prisma.user.findUnique({ where: { id: userId } });
    if (!buyer?.email) throw new Error("Buyer not found or missing email");

    const blocks = await prisma.block.findMany({
      where: {
        id: { in: blockIds },
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      include: {
        creator: true,
      },
    });

    if (blocks.length !== blockIds.length) {
      throw new Error("Some blocks not found or not purchasable");
    }

    const creatorIds = new Set(blocks.map((b) => b.creatorId));
    if (creatorIds.size !== 1) {
      throw new Error("Checkout must contain blocks from a single creator");
    }

    const creator = blocks[0]?.creator;
    if (!creator) throw new Error("Creator missing");
    if (!creator.isApprovedSeller)
      throw new Error("Creator is not approved to sell");
    if (!creator.stripeAccountId)
      throw new Error("Creator has no Stripe account connected");
    if (creator.stripeAccountStatus !== "ENABLED")
      throw new Error("Creator Stripe account not enabled");

    // money calc (in cents)
    const items = blocks.map((b) => {
      const priceCents = toCents(b.price);
      const feeBps = b.platformFeeBps;
      const platformFeeCents = calcPlatformFeeCents(priceCents, feeBps);
      const grossCents = priceCents + platformFeeCents;

      return {
        block: b,
        priceCents,
        platformFeeCents,
        grossCents,
      };
    });

    const subtotalCents = items.reduce((acc, it) => acc + it.priceCents, 0);
    const platformFeeCents = items.reduce(
      (acc, it) => acc + it.platformFeeCents,
      0
    );
    const totalCents = items.reduce((acc, it) => acc + it.grossCents, 0);

    // DB record first (PENDING)
    const purchase = await prisma.purchase.create({
      data: {
        buyerId: userId,
        status: "PENDING",
        currency: "USD",
        subtotalAmount: new Prisma.Decimal(fromCents(subtotalCents)),
        platformFeeAmount: new Prisma.Decimal(fromCents(platformFeeCents)),
        stripeFeeAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(fromCents(totalCents)),
        lineItems: {
          create: items.map((it) => ({
            blockId: it.block.id,
            unitPrice: it.block.price,
            quantity: 1,
            licenseType,
          })),
        },
      },
      include: { lineItems: true },
    });

    // Stripe Checkout Session
    // IMPORTANT: Raw body webhook verification requires your endpoint not to parse the body before constructEvent. :contentReference[oaicite:1]{index=1}
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: buyer.email,

      line_items: items.map((it) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: it.block.title,
            description: it.block.description ?? undefined,
          },
          unit_amount: it.grossCents, // buyer pays price + platform fee
        },
      })),

      // This groups downstream transfers for idempotency/lookups
      payment_intent_data: {
        transfer_group: purchase.id,
        metadata: {
          purchaseId: purchase.id,
          buyerId: userId,
          creatorId: creator.id,
        },
      },

      success_url: `${env.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/checkout/cancel`,

      metadata: {
        purchaseId: purchase.id,
        buyerId: userId,
        creatorId: creator.id,
      },
    });

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        stripeCheckoutSessionId: session.id,
      },
    });

    if (!session.url) throw new Error("Stripe session URL missing");

    return { purchaseId: purchase.id, checkoutUrl: session.url };
  },

  /**
   * Fulfill: marca PAID, crea Licenses, incrementa soldCount.
   * Idempotente a nivel Purchase.status.
   */
  async fulfillPurchase(
    purchaseId: string,
    stripePaymentIntentId: string,
    stripeChargeId: string | null
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { lineItems: true },
      });

      if (!existing) throw new Error("Purchase not found");
      if (existing.status === "PAID") return existing;

      const updated = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId,
          stripeChargeId: stripeChargeId ?? undefined,
        },
        include: { lineItems: true },
      });

      for (const item of updated.lineItems) {
        // Avoid duplicates if your unique constraint exists on License (recommended)
        await tx.license.create({
          data: {
            purchaseId: updated.id,
            buyerId: updated.buyerId,
            blockId: item.blockId,
            type: item.licenseType,
            status: "ACTIVE",
            deliveryStatus: "READY",
            deliveryReadyAt: new Date(),
            transactionHash: randomBytes(32).toString("hex"),
          },
        });

        await tx.block.update({
          where: { id: item.blockId },
          data: { soldCount: { increment: 1 } },
        });
      }

      return updated;
    });
  },
};
