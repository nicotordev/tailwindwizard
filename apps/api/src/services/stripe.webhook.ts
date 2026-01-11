// src/routes/stripe.webhook.ts
import { Hono } from "hono";
import type Stripe from "stripe";
import env from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import stripe, { stripeMetadataKeys } from "../lib/stripe.js";
import { notificationService } from "../services/notification.service.js";
import { payoutService } from "../services/payout.service.js";
import { purchaseService } from "../services/purchase.service.js";

function getHeader(headers: Headers, name: string): string | null {
  // Headers are case-insensitive; use get()
  return headers.get(name);
}

async function upsertWebhookEventOrReturnProcessed(
  externalId: string,
  eventType: string,
  payload: unknown
) {
  // If externalId unique constraint exists, this is enough for idempotency
  try {
    const created = await prisma.webhookEvent.create({
      data: {
        provider: "STRIPE",
        status: "RECEIVED",
        externalId,
        eventType,
        payload: payload as object, // Prisma Json input type accepts object
      },
    });
    return { created, alreadyProcessed: false as const };
  } catch (err) {
    // Unique violation: treat as already received/processed
    // Prisma error codes are typed as unknown in TS; do a safe string check without any.
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return { created: null, alreadyProcessed: true as const };
    }
    throw err;
  }
}

export const stripeWebhookRoute = new Hono().post(
  "/webhooks/stripe",
  async (c) => {
    const sig = getHeader(c.req.raw.headers, "stripe-signature");
    if (!sig) return c.text("Missing Stripe-Signature", 400);

    const rawBody = await c.req.raw.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        env.stripeWebhookSecret
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signature verification failed";
      return c.text(message, 400);
    }

    const { alreadyProcessed } = await upsertWebhookEventOrReturnProcessed(
      event.id,
      event.type,
      event.data
    );

    if (alreadyProcessed) {
      return c.json({ received: true, idempotent: true });
    }

    try {
      // Handle events
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const purchaseId = session.metadata?.[stripeMetadataKeys.purchaseId];
        if (!purchaseId)
          throw new Error("Missing purchaseId in session.metadata");

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null;
        if (!paymentIntentId)
          throw new Error("Missing payment_intent in session");

        // Retrieve payment intent to get latest_charge (optional but useful)
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        const latestChargeId = pi.latest_charge as string | null;

        await prisma.purchase.update({
          where: { id: purchaseId },
          data: {
            stripeCheckoutSessionId: session.id,
          },
        });

        await purchaseService.fulfillPurchase(
          purchaseId,
          paymentIntentId,
          latestChargeId
        );

        // Transfers to creators (seller side)
        await payoutService.transferToCreatorsForPurchase(purchaseId);

        const purchase = await prisma.purchase.findUnique({
          where: { id: purchaseId },
          include: {
            buyer: { select: { id: true } },
            lineItems: {
              include: {
                block: {
                  include: {
                    creator: { select: { userId: true } },
                  },
                },
              },
            },
          },
        });

        if (purchase) {
          const itemCount = purchase.lineItems.length;

          try {
            await notificationService.notifyPurchaseCompleted({
              buyerId: purchase.buyerId,
              purchaseId: purchase.id,
              itemCount,
            });

            const creatorUserId =
              purchase.lineItems[0]?.block.creator.userId ?? null;

            if (creatorUserId) {
              await notificationService.notifyCreatorSale({
                creatorUserId,
                purchaseId: purchase.id,
                itemCount,
              });
            }
          } catch (notifyError) {
            console.error("Notification dispatch failed:", notifyError);
          }
        }

        await prisma.webhookEvent.update({
          where: { externalId: event.id },
          data: { status: "PROCESSED", processedAt: new Date() },
        });

        return c.json({ received: true });
      }

      if (
        event.type === "checkout.session.async_payment_failed" ||
        event.type === "payment_intent.payment_failed"
      ) {
        // Best-effort: mark purchase FAILED if we can resolve purchaseId from metadata.
        const obj = event.data.object as { metadata?: Record<string, string> };
        const metadata = obj.metadata;

        const purchaseId = metadata?.[stripeMetadataKeys.purchaseId];
        if (purchaseId) {
          await prisma.purchase.update({
            where: { id: purchaseId },
            data: { status: "FAILED", updatedAt: new Date() },
          });
        }

        const buyerId = metadata?.[stripeMetadataKeys.buyerId];
        if (buyerId) {
          try {
            await notificationService.notifyPurchaseFailed({
              buyerId,
              purchaseId,
            });
          } catch (notifyError) {
            console.error("Notification dispatch failed:", notifyError);
          }
        }

        await prisma.webhookEvent.update({
          where: { externalId: event.id },
          data: { status: "PROCESSED", processedAt: new Date() },
        });

        return c.json({ received: true });
      }

      // Ignore other events safely
      await prisma.webhookEvent.update({
        where: { externalId: event.id },
        data: { status: "IGNORED", processedAt: new Date() },
      });

      return c.json({ received: true, ignored: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Webhook handler failed";

      await prisma.webhookEvent.update({
        where: { externalId: event.id },
        data: { status: "FAILED", error: message, processedAt: new Date() },
      });

      return c.text(message, 500);
    }
  }
);
