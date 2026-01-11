import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { BlockSchema, CreatorSchema, UserSchema } from "@tw/shared";
import { adminController } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const adminApp = new OpenAPIHono();

adminApp.use("*", requireAuth);

const PaginationMeta = z
  .object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
  .openapi("PaginationMeta");

// GET /moderation
const listModerationRoute = createRoute({
  method: "get",
  path: "/moderation",
  tags: ["Admin"],
  summary: "List submitted blocks",
  request: {
    query: z.object({
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("20"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(BlockSchema),
            meta: PaginationMeta,
          }),
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

// GET /users
const listUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["Admin"],
  summary: "List users",
  request: {
    query: z.object({
      q: z.string().optional(),
      role: z.enum(["ADMIN", "USER"]).optional(),
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("20"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(UserSchema),
            meta: PaginationMeta,
          }),
        },
      },
      description: "List of users",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
  },
});

// PATCH /users/{userId}/role
const updateUserRoleRoute = createRoute({
  method: "patch",
  path: "/users/{userId}/role",
  tags: ["Admin"],
  summary: "Update user role",
  request: {
    params: z.object({
      userId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            role: z.enum(["ADMIN", "USER"]),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "User role updated",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
  },
});

// GET /creators
const listCreatorsRoute = createRoute({
  method: "get",
  path: "/creators",
  tags: ["Admin"],
  summary: "List creators",
  request: {
    query: z.object({
      status: z.enum(["pending", "approved", "rejected"]).optional(),
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("20"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(
              CreatorSchema.extend({ user: UserSchema.optional() })
            ),
            meta: PaginationMeta,
          }),
        },
      },
      description: "List of creators",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
  },
});

// POST /creators/{creatorId}/review
const reviewCreatorRoute = createRoute({
  method: "post",
  path: "/creators/{creatorId}/review",
  tags: ["Admin"],
  summary: "Review creator application",
  request: {
    params: z.object({
      creatorId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            action: z.enum(["APPROVE", "REJECT"]),
            reason: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CreatorSchema,
        },
      },
      description: "Creator reviewed",
    },
    401: { description: "Unauthorized" },
    403: { description: "Forbidden" },
  },
});

const chainedApp = adminApp
  .openapi(listModerationRoute, (c) => adminController.listModeration(c))
  .openapi(decideRoute, (c) => adminController.decide(c))
  .openapi(listUsersRoute, (c) => adminController.listUsers(c))
  .openapi(updateUserRoleRoute, (c) => adminController.updateUserRole(c))
  .openapi(listCreatorsRoute, (c) => adminController.listCreators(c))
  .openapi(reviewCreatorRoute, (c) => adminController.reviewCreator(c));

export default chainedApp;
