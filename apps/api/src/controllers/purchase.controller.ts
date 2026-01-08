import type { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { purchaseService } from "../services/purchase.service.js";
import { prisma } from "../db/prisma.js";

export const purchaseController = {
  async checkout(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({
      where: { externalAuthId: auth.userId },
    });
    if (!user) return c.json({ message: "User not found" }, 404);

    const body = await c.req.json();
    const { blockIds, licenseType } = body;

    try {
      const purchase = await purchaseService.createPendingPurchase(
        user.id,
        blockIds,
        licenseType
      );

      return c.json(
        {
          purchase,
          checkoutUrl: "https://checkout.stripe.com/mock-session",
        },
        201
      );
    } catch (e: any) {
      return c.json({ message: e.message }, 400);
    }
  },

  async simulateSuccess(c: Context) {
    const id = c.req.param("id");
    if (!id) return c.json({ message: "Missing ID" }, 400);

    const purchase = await purchaseService.fulfillPurchase(id, "pi_mock_" + id);
    return c.json(purchase, 200);
  },
};
