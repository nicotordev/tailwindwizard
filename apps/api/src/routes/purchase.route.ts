import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { purchaseController } from "../controllers/purchase.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  CheckoutResponseSchema,
  CreateCheckoutSchema,
  PurchaseSchema,
} from "../schemas/purchase.schema.js";

const purchaseApp = new OpenAPIHono();

purchaseApp.use("*", requireAuth);

const checkoutRoute = createRoute({
  method: "post",
  path: "/checkout",
  tags: ["Commerce"],
  summary: "Initialize checkout",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCheckoutSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CheckoutResponseSchema,
        },
      },
      description: "Checkout session created",
    },
    400: { description: "Bad Request" },
    401: { description: "Unauthorized" },
    404: { description: "Not Found" },
  },
});

const simulateSuccessRoute = createRoute({
  method: "post",
  path: "/simulate-success/{id}",
  tags: ["Commerce"],
  summary: "Simulate successful payment (Dev only)",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: PurchaseSchema } },
      description: "Purchase fulfilled",
    },
    400: { description: "Bad Request" },
  },
});

purchaseApp.openapi(checkoutRoute, purchaseController.checkout);
purchaseApp.openapi(simulateSuccessRoute, purchaseController.simulateSuccess);

export default purchaseApp;
