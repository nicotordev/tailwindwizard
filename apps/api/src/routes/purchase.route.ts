// src/routes/purchase.route.ts
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { purchaseController } from "../controllers/purchase.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  CheckoutResponseSchema,
  CreateCheckoutSchema,
  PurchaseSchema,
  LicenseListSchema,
} from "../schemas/purchase.schema.js";

const purchaseApp = new OpenAPIHono();

purchaseApp.use("*", requireAuth);

// POST /purchase/checkout
const checkoutRoute = createRoute({
  method: "post",
  path: "/checkout",
  tags: ["Commerce"],
  summary: "Initialize checkout",
  request: {
    body: {
      content: {
        "application/json": { schema: CreateCheckoutSchema },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": { schema: CheckoutResponseSchema },
      },
      description: "Checkout session created",
    },
    400: { description: "Bad Request" },
    401: { description: "Unauthorized" },
    404: { description: "Not Found" },
  },
});

// GET /purchase/{id}
const getPurchaseRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Commerce"],
  summary: "Get purchase status and delivery info",
  request: {
    params: z.object({
      id: z.string().min(1),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: PurchaseSchema },
      },
      description: "Purchase returned",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
    404: { description: "Not Found" },
  },
});

// GET /purchase/me/licenses
const myLicensesRoute = createRoute({
  method: "get",
  path: "/me/licenses",
  tags: ["Commerce"],
  summary: "List my licenses",
  responses: {
    200: {
      content: {
        "application/json": { schema: LicenseListSchema },
      },
      description: "Licenses returned",
    },
    401: { description: "Unauthorized" },
  },
});

purchaseApp.openapi(checkoutRoute, (c) => purchaseController.checkout(c));
purchaseApp.openapi(getPurchaseRoute, (c) => purchaseController.getPurchase(c));
purchaseApp.openapi(myLicensesRoute, (c) => purchaseController.myLicenses(c));

export default purchaseApp;
