import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import type { ZodIssue } from "zod";
import { prisma } from "../db/prisma.js";
import { CreateCheckoutSchema } from "@tw/shared";
import { purchaseService } from "../services/purchase.service.js";

const RESPONSE_MESSAGES = {
  unauthorized: { message: "Unauthorized" },
  invalidBody: { message: "Invalid request body" },
  missingPurchaseId: { message: "Missing purchase id" },
  notFound: { message: "Not found" },
  forbidden: { message: "Forbidden" },
} as const;

const purchaseInclude = {
  lineItems: {
    include: {
      block: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          currency: true,
        },
      },
    },
  },
  licenses: {
    include: {
      block: {
        select: { id: true, title: true, slug: true },
      },
    },
  },
} as const;

type PurchaseWithRelations = NonNullable<
  Awaited<ReturnType<typeof fetchPurchaseWithRelations>>
>;

type LicenseList = Awaited<ReturnType<typeof fetchUserLicenses>>;
type UserLicense = LicenseList[number];

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

function respondUnauthorized(c: Context) {
  return c.json(RESPONSE_MESSAGES.unauthorized, 401);
}

function respondMissingPurchaseId(c: Context) {
  return c.json(RESPONSE_MESSAGES.missingPurchaseId, 400);
}

function validationErrorResponse(c: Context, issues: ZodIssue[]) {
  return c.json(
    {
      ...RESPONSE_MESSAGES.invalidBody,
      issues: formatIssues(issues),
    },
    400
  );
}

function formatIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

async function getUserIdFromClerk(c: Context): Promise<string | null> {
  const auth = getAuth(c);
  if (!auth?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { externalAuthId: auth.userId },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function parseCheckoutBody(c: Context) {
  const body = (await c.req.json().catch(() => null)) as unknown;
  return CreateCheckoutSchema.safeParse(body);
}

async function fetchPurchaseWithRelations(purchaseId: string) {
  return prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: purchaseInclude,
  });
}

function mapLineItem(lineItem: PurchaseWithRelations["lineItems"][number]) {
  return {
    blockId: lineItem.blockId,
    title: lineItem.block.title,
    slug: lineItem.block.slug,
    unitPrice: lineItem.unitPrice,
    licenseType: lineItem.licenseType,
    quantity: lineItem.quantity,
  };
}

function mapLicense(license: PurchaseWithRelations["licenses"][number]) {
  return {
    id: license.id,
    blockId: license.blockId,
    blockSlug: license.block.slug,
    blockTitle: license.block.title,
    type: license.type,
    status: license.status,
    deliveryStatus: license.deliveryStatus,
    deliveryReadyAt: license.deliveryReadyAt,
    transactionHash: license.transactionHash,
  };
}

function buildPurchasePayload(purchase: PurchaseWithRelations) {
  return {
    id: purchase.id,
    status: purchase.status,
    currency: purchase.currency,
    subtotalAmount: purchase.subtotalAmount,
    platformFeeAmount: purchase.platformFeeAmount,
    totalAmount: purchase.totalAmount,
    paidAt: purchase.paidAt,
    stripeCheckoutSessionId: purchase.stripeCheckoutSessionId,
    stripePaymentIntentId: purchase.stripePaymentIntentId,
    items: purchase.lineItems.map(mapLineItem),
    licenses: purchase.licenses.map(mapLicense),
  };
}

async function fetchUserLicenses(userId: string) {
  return prisma.license.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      block: {
        select: { id: true, title: true, slug: true },
      },
      purchase: {
        select: { id: true, status: true, paidAt: true },
      },
    },
  });
}

function mapUserLicense(license: UserLicense) {
  return {
    id: license.id,
    type: license.type,
    status: license.status,
    deliveryStatus: license.deliveryStatus,
    createdAt: license.createdAt,
    block: license.block,
    purchase: license.purchase,
  };
}

export const purchaseController = {
  /**
   * Real checkout: crea Purchase=PENDING y devuelve checkoutUrl real de Stripe
   */
  async checkout(c: Context) {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return respondUnauthorized(c);

    const parsed = await parseCheckoutBody(c);
    if (!parsed.success) {
      return validationErrorResponse(c, parsed.error.issues);
    }

    try {
      const result = await purchaseService.createPendingPurchase(
        userId,
        parsed.data.blockIds,
        parsed.data.licenseType
      );

      // result: { purchaseId, checkoutUrl }
      return c.json(result, 201);
    } catch (err: unknown) {
      return c.json({ message: errorMessage(err) }, 400);
    }
  },

  /**
   * Real: el frontend llama esto después del redirect de Stripe (success_url)
   * para saber si ya quedó PAID y obtener licencias.
   */
  async getPurchase(c: Context) {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return respondUnauthorized(c);

    const purchaseId = c.req.param("id");
    if (!purchaseId) return respondMissingPurchaseId(c);

    const purchase = await fetchPurchaseWithRelations(purchaseId);

    if (!purchase) return c.json(RESPONSE_MESSAGES.notFound, 404);
    if (purchase.buyerId !== userId) {
      return c.json(RESPONSE_MESSAGES.forbidden, 403);
    }

    return c.json(buildPurchasePayload(purchase), 200);
  },

  /**
   * Real: lista de licencias del usuario (mis compras)
   */
  async myLicenses(c: Context) {
    const userId = await getUserIdFromClerk(c);
    if (!userId) return respondUnauthorized(c);

    const licenses = await fetchUserLicenses(userId);

    return c.json(licenses.map(mapUserLicense), 200);
  },
};
