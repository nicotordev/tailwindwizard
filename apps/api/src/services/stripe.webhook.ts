// src/services/stripe.webhook.ts
import { Hono } from "hono";
import type Stripe from "stripe";
import env from "../config/env.config.js";
import type { PlanTier } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import stripe, { stripeMetadataKeys } from "../lib/stripe.js";
import { notificationService } from "../services/notification.service.js";
import { payoutService } from "../services/payout.service.js";
import { purchaseService } from "../services/purchase.service.js";

const webhookSecrets = [
  env.stripeWebhookSecret,
  env.stripeWebhookSecretSecondary,
].filter((secret): secret is string => Boolean(secret));

function getHeader(headers: Headers, name: string): string | null {
  return headers.get(name);
}

async function upsertWebhookEventOrReturnProcessed(
  externalId: string,
  eventType: string,
  payload: unknown
) {
  try {
    const created = await prisma.webhookEvent.create({
      data: {
        provider: "STRIPE",
        status: "RECEIVED",
        externalId,
        eventType,
        payload: payload as object,
      },
    });
    return { created, alreadyProcessed: false as const };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg.includes("Unique constraint") || msg.includes("P2002")) {
      return { created: null, alreadyProcessed: true as const };
    }
    throw err;
  }
}

// --- Helpers ---

async function markWebhookProcessed(externalId: string) {
  await prisma.webhookEvent.update({
    where: { externalId },
    data: { status: "PROCESSED", processedAt: new Date() },
  });
}

async function updateCreatorFromStripeAccount(stripeAccountId: string) {
  const account = await stripe.accounts.retrieve(stripeAccountId);
  
  let creator = await prisma.creator.findUnique({
    where: { stripeAccountId: account.id }
  });

  if (!creator && account.metadata?.creatorId) {
    creator = await prisma.creator.findUnique({
      where: { id: account.metadata.creatorId },
    });
  }

  if (creator) {
    const isEnabled = account.charges_enabled && account.payouts_enabled;
    
    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        stripeDetailsSubmitted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeAccountStatus: isEnabled ? "ENABLED" : "PENDING",
        isApprovedSeller: isEnabled ? true : creator.isApprovedSeller,
        approvedAt: isEnabled && !creator.approvedAt ? new Date() : creator.approvedAt,
      }
    });
  } else {
    console.warn(`[Webhook] Creator not found for Stripe account ${stripeAccountId}`);
  }
}

async function resolvePurchaseId(
  metadata: Stripe.Metadata | null | undefined,
  stripeRefs: { paymentIntentId?: string | null; chargeId?: string | null }
): Promise<string | null> {
  // 1. Metadata
  if (metadata?.[stripeMetadataKeys.purchaseId]) {
    return metadata[stripeMetadataKeys.purchaseId] ?? null;
  }

  // 2. Search by refs
  if (stripeRefs.paymentIntentId) {
    const p = await prisma.purchase.findUnique({
      where: { stripePaymentIntentId: stripeRefs.paymentIntentId },
      select: { id: true }
    });
    if (p) return p.id;
  }

  if (stripeRefs.chargeId) {
    const p = await prisma.purchase.findUnique({
      where: { stripeChargeId: stripeRefs.chargeId },
      select: { id: true }
    });
    if (p) return p.id;
  }

  return null;
}

async function fulfill(purchaseId: string, paymentIntentId: string, chargeId: string | null) {
  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) return;

  if (purchase.status === "PAID") return;

  await purchaseService.fulfillPurchase(purchaseId, paymentIntentId, chargeId);
  await payoutService.transferToCreatorsForPurchase(purchaseId);

  // Notify
  const p = await prisma.purchase.findUnique({
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

  if (p) {
    const itemCount = p.lineItems.length;
    await notificationService.notifyPurchaseCompleted({
      buyerId: p.buyerId,
      purchaseId: p.id,
      itemCount,
    });

    const creatorUserId = p.lineItems[0]?.block.creator.userId;
    if (creatorUserId) {
      await notificationService.notifyCreatorSale({
        creatorUserId,
        purchaseId: p.id,
        itemCount,
      });
    }
  }
}

// --- Main Handler ---

export const stripeWebhookRoute = new Hono().post(
  "/webhooks/stripe",
  async (c) => {
    const sig = getHeader(c.req.raw.headers, "stripe-signature");
    if (!sig) return c.text("Missing Stripe-Signature", 400);

    const rawBody = await c.req.raw.text();

    let event: Stripe.Event | null = null;
    let lastError: unknown;
    
    for (const secret of webhookSecrets) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, secret);
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!event) {
      const message = lastError instanceof Error ? lastError.message : "Signature verification failed";
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
      switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
          const session = event.data.object;
          const purchaseId = await resolvePurchaseId(session.metadata, {});
          
          if (!purchaseId) {
            console.warn(`[Webhook] Missing purchaseId in session ${session.id}`);
            break;
          }

          const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
          if (!paymentIntentId) break;

          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          const latestChargeId = pi.latest_charge as string | null;

          await fulfill(purchaseId, paymentIntentId, latestChargeId);
          break;
        }

        case "payment_intent.succeeded": {
          const pi = event.data.object;
          const purchaseId = await resolvePurchaseId(pi.metadata, { paymentIntentId: pi.id });
          
          if (purchaseId) {
            await fulfill(purchaseId, pi.id, pi.latest_charge as string | null);
          }
          break;
        }

        case "checkout.session.async_payment_failed":
        case "payment_intent.payment_failed": {
          const obj = event.data.object as { 
            id: string; 
            object: string; 
            metadata?: Stripe.Metadata; 
            payment_intent?: string | null;
          };
          
          const purchaseId = await resolvePurchaseId(obj.metadata, { 
            paymentIntentId: obj.object === "payment_intent" ? obj.id : (obj.payment_intent ?? null) 
          });
          
          if (purchaseId) {
            await prisma.purchase.update({
              where: { id: purchaseId },
              data: { status: "FAILED", updatedAt: new Date() },
            });

            const buyerId = obj.metadata?.[stripeMetadataKeys.buyerId];
            if (buyerId) {
              await notificationService.notifyPurchaseFailed({ buyerId, purchaseId });
            }
          }
          break;
        }

        case "payment_intent.requires_action": {
          const pi = event.data.object;
          const purchaseId = await resolvePurchaseId(pi.metadata, { paymentIntentId: pi.id });
          
          if (purchaseId) {
            console.info(`[Webhook] PaymentIntent ${pi.id} requires action for purchase ${purchaseId}`);
          }
          break;
        }

        case "account.updated": {
          const account = event.data.object;
          await updateCreatorFromStripeAccount(account.id);
          break;
        }

        case "capability.updated": {
          const capability = event.data.object;
          if (typeof capability.account === "string") {
            await updateCreatorFromStripeAccount(capability.account);
          }
          break;
        }

        case "account.external_account.updated": {
          const externalAccount = event.data.object;
          if (externalAccount.account && typeof externalAccount.account === "string") {
            await updateCreatorFromStripeAccount(externalAccount.account);
          }
          break;
        }

        case "refund.created": {
          const refund = event.data.object;
          const purchaseId = await resolvePurchaseId(refund.metadata, {
            paymentIntentId: typeof refund.payment_intent === "string" ? refund.payment_intent : null,
            chargeId: typeof refund.charge === "string" ? refund.charge : null,
          });

          if (purchaseId) {
            await prisma.purchase.update({
              where: { id: purchaseId },
              data: { refundStatus: "REQUESTED" }
            });
          }
          break;
        }

        case "charge.refunded": {
          const charge = event.data.object;
          const purchaseId = await resolvePurchaseId(charge.metadata, {
            paymentIntentId: typeof charge.payment_intent === "string" ? charge.payment_intent : null,
            chargeId: charge.id,
          });

          if (purchaseId) {
            await prisma.$transaction(async (tx) => {
              const p = await tx.purchase.findUnique({ where: { id: purchaseId } });
              if (!p || p.status === "REFUNDED") return;

              await tx.purchase.update({
                where: { id: purchaseId },
                data: {
                  status: "REFUNDED",
                  refundStatus: "PROCESSED",
                  refundedAt: new Date(),
                }
              });

              await tx.license.updateMany({
                where: { purchaseId },
                data: {
                  status: "REVOKED",
                  deliveryStatus: "REVOKED",
                  revokedAt: new Date(),
                  revokeReason: "Refunded via Stripe",
                }
              });
            });
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object;
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: sub.customer as string }
          });

          if (user) {
            const planTier = sub.metadata.planTier as PlanTier | undefined;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const periodEnd = (sub as any).current_period_end ?? sub.items.data[0]?.current_period_end;
            
            await prisma.user.update({
              where: { id: user.id },
              data: {
                planTier: planTier ?? user.planTier,
                planExpiresAt: periodEnd ? new Date(periodEnd * 1000) : user.planExpiresAt,
              }
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const sub = event.data.object;
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: sub.customer as string }
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                planTier: "FREE",
                planExpiresAt: new Date(),
              }
            });
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object;
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: invoice.customer as string }
          });

          if (user) {
            const planTier = invoice.metadata?.planTier as PlanTier | undefined;
            const periodEnd = invoice.period_end;
            
            await prisma.user.update({
              where: { id: user.id },
              data: {
                planTier: planTier ?? user.planTier,
                planExpiresAt: periodEnd ? new Date(periodEnd * 1000) : undefined,
              }
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: invoice.customer as string }
          });

          if (user && invoice.metadata?.planTier) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                planTier: "FREE",
                planExpiresAt: new Date(),
              }
            });
          }
          break;
        }

        default:
          console.info(`[Webhook] Unhandled event type: ${event.type}`);
          break;
      }

      await markWebhookProcessed(event.id);
      return c.json({ received: true });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook handler failed";
      console.error(`[Webhook Error] ${event.type}: ${message}`, err);

      await prisma.webhookEvent.update({
        where: { externalId: event.id },
        data: { status: "FAILED", error: message, processedAt: new Date() },
      });

      return c.text(message, 500);
    }
  }
);
