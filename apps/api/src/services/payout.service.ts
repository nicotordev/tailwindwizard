// src/services/payout.service.ts
import type Stripe from "stripe";
import { Prisma } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import stripe from "../lib/stripe.js";
import { calcPlatformFeeCents, toCents } from "../utils/money.js";

interface CreatorPayoutCalc {
  creatorId: string;
  stripeAccountId: string;
  currency: "usd";
  amountCents: number; // net to creator
}

export const payoutService = {
  async transferToCreatorsForPurchase(purchaseId: string): Promise<void> {
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        lineItems: {
          include: {
            block: {
              include: {
                creator: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) throw new Error("Purchase not found");
    if (purchase.status !== "PAID") throw new Error("Purchase is not PAID yet");
    if (!purchase.stripePaymentIntentId)
      throw new Error("Missing stripePaymentIntentId");

    // Compute payouts (net = priceCents; platform keeps fee; stripe fees assumed absorbed by platform)
    const byCreator = new Map<string, CreatorPayoutCalc>();

    for (const item of purchase.lineItems) {
      const block = item.block;
      const creator = block.creator;
      if (!creator) throw new Error("Block.creator missing");
      if (creator.stripeAccountStatus !== "ENABLED")
        throw new Error("Creator Stripe account not enabled");

      const priceCents = toCents(block.price);
      const platformFeeBps = block.platformFeeBps;

      // Buyer already paid (price + fee). Seller gets price.
      // If quieres que seller pague parte del fee, cambia acá.
      const netToSellerCents = priceCents;

      const prev = byCreator.get(creator.id);
      if (!prev) {
        if (!creator.stripeAccountId) {
          throw new Error(`Creator ${creator.id} has no Stripe account connected`);
        }
        byCreator.set(creator.id, {
          creatorId: creator.id,
          stripeAccountId: creator.stripeAccountId,
          currency: "usd",
          amountCents: netToSellerCents,
        });
      } else {
        prev.amountCents += netToSellerCents;
      }

      // (opcional) validación: fee no negativo
      const _platformFeeCents = calcPlatformFeeCents(
        priceCents,
        platformFeeBps
      );
      if (_platformFeeCents < 0) throw new Error("Invalid platform fee");
    }

    // Idempotency: check existing transfers with transfer_group=purchaseId
    const existingTransfers = await stripe.transfers.list({
      transfer_group: purchaseId,
      limit: 100,
    });

    const existingByDestination = new Map<string, Stripe.Transfer[]>();
    for (const t of existingTransfers.data) {
      const dest =
        typeof t.destination === "string"
          ? t.destination
          : (t.destination?.id ?? "");
      if (!dest) continue;
      const arr = existingByDestination.get(dest) ?? [];
      arr.push(t);
      existingByDestination.set(dest, arr);
    }

    for (const payout of byCreator.values()) {
      const already = existingByDestination.get(payout.stripeAccountId) ?? [];
      const alreadyHasSameAmount = already.some(
        (t) => t.amount === payout.amountCents && t.currency === payout.currency
      );

      if (alreadyHasSameAmount) {
        // we assume payout already done
        continue;
      }

      const transfer = await stripe.transfers.create({
        amount: payout.amountCents,
        currency: payout.currency,
        destination: payout.stripeAccountId,
        transfer_group: purchaseId,
        metadata: {
          purchaseId,
          creatorId: payout.creatorId,
          buyerId: purchase.buyerId,
        },
      });

      await prisma.payout.create({
        data: {
          creatorId: payout.creatorId,
          currency: "USD",
          amount: new Prisma.Decimal(transfer.amount / 100),
          stripeTransferId: transfer.id,
          periodStart: purchase.paidAt ?? purchase.createdAt,
          periodEnd: purchase.paidAt ?? purchase.createdAt,
          paidAt: new Date(),
        },
      });
    }
  },
};
