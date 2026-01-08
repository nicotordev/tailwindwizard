import { prisma } from "../db/prisma.js";
import type { Prisma, LicenseType } from "../db/generated/prisma/client.js";
import { randomBytes } from "crypto";

export const purchaseService = {
  async createPendingPurchase(userId: string, blockIds: string[], licenseType: LicenseType = "PERSONAL") {
    // 1. Fetch blocks to get prices
    const blocks = await prisma.block.findMany({
      where: { id: { in: blockIds } },
    });

    if (blocks.length === 0) throw new Error("No blocks found");

    const subtotal = blocks.reduce((acc, b) => acc + Number(b.price), 0);
    // simplified fee calc
    const platformFee = subtotal * 0.15; 
    const total = subtotal + platformFee;

    // 2. Create Purchase and LineItems
    return prisma.purchase.create({
      data: {
        buyerId: userId,
        status: "PENDING",
        subtotalAmount: subtotal,
        platformFeeAmount: platformFee,
        stripeFeeAmount: 0, // calc after stripe
        totalAmount: total,
        currency: "USD",
        lineItems: {
          create: blocks.map((b) => ({
            blockId: b.id,
            unitPrice: b.price,
            licenseType: licenseType,
          })),
        },
      },
    });
  },

  async fulfillPurchase(purchaseId: string, stripePaymentIntentId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Update purchase status
      const purchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripePaymentIntentId,
        },
        include: {
          lineItems: true,
        },
      });

      // 2. Create Licenses for each line item
      for (const item of purchase.lineItems) {
        await tx.license.create({
          data: {
            purchaseId: purchase.id,
            buyerId: purchase.buyerId,
            blockId: item.blockId,
            type: item.licenseType,
            status: "ACTIVE",
            deliveryStatus: "READY",
            deliveryReadyAt: new Date(),
            transactionHash: randomBytes(32).toString("hex"),
          },
        });

        // 3. Increment soldCount for the block
        await tx.block.update({
          where: { id: item.blockId },
          data: { soldCount: { increment: 1 } },
        });
      }

      return purchase;
    });
  },
};
