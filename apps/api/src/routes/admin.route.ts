import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { adminController } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { BlockSchema } from "@tw/shared";

const adminApp = new OpenAPIHono();

adminApp.use("*", requireAuth);

// GET /moderation
const listModerationRoute = createRoute({
  method: "get",
  path: "/moderation",
  tags: ["Admin"],
  summary: "List submitted blocks",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(BlockSchema),
        },
      },
      description: "List of submitted blocks",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
  },
});

// POST /moderation/{blockId}/decide
const decideRoute = createRoute({
  method: "post",
  path: "/moderation/{blockId}/decide",
  tags: ["Admin"],
  summary: "Make moderation decision",
  request: {
    params: z.object({
      blockId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            decision: z.enum(["APPROVE", "REJECT", "REQUEST_CHANGES"]),
            notes: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "Decision recorded",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
  },
});

const chainedApp = adminApp
  .openapi(listModerationRoute, (c) => adminController.listModeration(c))
  .openapi(decideRoute, (c) => adminController.decide(c));

export default chainedApp;
