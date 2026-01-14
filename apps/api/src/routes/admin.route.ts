import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  BlockSchema,
  CategorySchema,
  WebhookEventSchema,
  TagSchema,
  UserSchema,
  PurchaseSchema,
  CreatorSchema,
} from "@tw/shared";
import { adminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const adminApp = new OpenAPIHono();

adminApp.use("*", requireAdmin);

const PaginationMeta = z
  .object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
  .openapi("PaginationMeta");

const UnauthorizedResponse = {
  description: "Unauthorized",
  content: {
    "application/json": {
      schema: z.object({ message: z.string() }),
    },
  },
};

const ForbiddenResponse = {
  description: "Forbidden",
  content: {
    "application/json": {
      schema: z.object({ message: z.string() }),
    },
  },
};

const NotFoundResponse = {
  description: "Not Found",
  content: {
    "application/json": {
      schema: z.object({ message: z.string() }),
    },
  },
};

const BadRequestResponse = {
  description: "Bad Request",
  content: {
    "application/json": {
      schema: z.object({ message: z.string() }),
    },
  },
};

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
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
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
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
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
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
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
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /users/{userId}/ban
const banUserRoute = createRoute({
  method: "post",
  path: "/users/{userId}/ban",
  tags: ["Admin"],
  summary: "Ban a user",
  request: {
    params: z.object({
      userId: z.string(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema } },
      description: "User banned",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /users/{userId}/unban
const unbanUserRoute = createRoute({
  method: "post",
  path: "/users/{userId}/unban",
  tags: ["Admin"],
  summary: "Unban a user",
  request: {
    params: z.object({
      userId: z.string(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema } },
      description: "User unbanned",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
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
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
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
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /creators/{creatorId}/ban
const banCreatorRoute = createRoute({
  method: "post",
  path: "/creators/{creatorId}/ban",
  tags: ["Admin"],
  summary: "Ban a creator",
  request: {
    params: z.object({
      creatorId: z.string(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: CreatorSchema } },
      description: "Creator banned",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /creators/{creatorId}/unban
const unbanCreatorRoute = createRoute({
  method: "post",
  path: "/creators/{creatorId}/unban",
  tags: ["Admin"],
  summary: "Unban a creator",
  request: {
    params: z.object({
      creatorId: z.string(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: CreatorSchema } },
      description: "Creator unbanned",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

const updateCreatorRoute = createRoute({
  method: "patch",
  path: "/creators/{creatorId}",
  tags: ["Admin"],
  summary: "Update creator profile",
  request: {
    params: z.object({
      creatorId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreatorSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: CreatorSchema } },
      description: "Creator updated",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// --- Category Management ---
const listCategoriesRoute = createRoute({
  method: "get",
  path: "/categories",
  tags: ["Admin"],
  summary: "List all categories",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(CategorySchema) } },
      description: "List of categories",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

const getCategoryByIdRoute = createRoute({
  method: "get",
  path: "/categories/{id}",
  tags: ["Admin"],
  summary: "Get category by id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: CategorySchema } },
      description: "Category by id",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

const createCategoryRoute = createRoute({
  method: "post",
  path: "/categories",
  tags: ["Admin"],
  summary: "Create a new category",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            icon: z.string().optional(),
            iconType: z
              .enum(["IMAGE", "LUCIDE", "REACT_ICON", "EMOJI"])
              .optional(),
            priority: z.number().optional(),
            isFeatured: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: CategorySchema } },
      description: "Category created",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    400: BadRequestResponse,
  },
});

const updateCategoryRoute = createRoute({
  method: "patch",
  path: "/categories/{id}",
  tags: ["Admin"],
  summary: "Update a category",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional(),
            slug: z.string().optional(),
            description: z.string().optional(),
            icon: z.string().optional(),
            iconType: z
              .enum(["IMAGE", "LUCIDE", "REACT_ICON", "EMOJI"])
              .optional(),
            priority: z.number().optional(),
            isFeatured: z.boolean().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: CategorySchema } },
      description: "Category updated",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    400: BadRequestResponse,
  },
});

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/categories/{id}",
  tags: ["Admin"],
  summary: "Delete a category",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
      description: "Category deleted",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// --- Tag Management ---
const listTagsRoute = createRoute({
  method: "get",
  path: "/tags",
  tags: ["Admin"],
  summary: "List all tags",
  responses: {
    200: {
      content: { "application/json": { schema: z.array(TagSchema) } },
      description: "List of tags",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

const createTagRoute = createRoute({
  method: "post",
  path: "/tags",
  tags: ["Admin"],
  summary: "Create a new tag",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            icon: z.string().optional(),
            iconType: z
              .enum(["IMAGE", "LUCIDE", "REACT_ICON", "EMOJI"])
              .optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: TagSchema } },
      description: "Tag created",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    400: BadRequestResponse,
  },
});

const updateTagRoute = createRoute({
  method: "patch",
  path: "/tags/{id}",
  tags: ["Admin"],
  summary: "Update a tag",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().optional(),
            slug: z.string().optional(),
            description: z.string().optional(),
            icon: z.string().optional(),
            iconType: z
              .enum(["IMAGE", "LUCIDE", "REACT_ICON", "EMOJI"])
              .optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TagSchema } },
      description: "Tag updated",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    400: BadRequestResponse,
  },
});

const deleteTagRoute = createRoute({
  method: "delete",
  path: "/tags/{id}",
  tags: ["Admin"],
  summary: "Delete a tag",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
      description: "Tag deleted",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// --- Finance / Commerce ---

const listPurchasesRoute = createRoute({
  method: "get",
  path: "/purchases",
  tags: ["Admin"],
  summary: "List all purchases",
  request: {
    query: z.object({
      status: z.string().optional(),
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
              PurchaseSchema.extend({
                buyer: z
                  .object({
                    id: z.string(),
                    name: z.string().nullable(),
                    email: z.string(),
                    avatarUrl: z.string().nullable(),
                  })
                  .optional(),
                lineItems: z
                  .array(
                    z.object({
                      block: z.object({
                        id: z.string(),
                        title: z.string(),
                        slug: z.string(),
                        screenshot: z.string().nullable().optional(),
                      }),
                    })
                  )
                  .optional(),
              })
            ),
            meta: PaginationMeta,
          }),
        },
      },
      description: "List of purchases",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

const getWebhookStatsRoute = createRoute({
  method: "get",
  path: "/finance/webhooks",
  tags: ["Admin"],
  summary: "Get webhook health stats",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            last24h: z.object({
              total: z.number(),
              failed: z.number(),
              pending: z.number(),
              successRate: z.number(),
            }),
            lastEvents: z.array(WebhookEventSchema),
          }),
        },
      },
      description: "Webhook stats",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

const getDashboardStatsRoute = createRoute({
  method: "get",
  path: "/stats",
  tags: ["Admin"],
  summary: "Get dashboard stats",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            pendingBlocks: z.number(),
            totalCreators: z.number(),
            totalRevenue: z.number(),
          }),
        },
      },
      description: "Dashboard stats",
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

const chainedApp = adminApp
  .openapi(listModerationRoute, (c) => adminController.listModeration(c))
  .openapi(decideRoute, (c) => adminController.decide(c))
  .openapi(listUsersRoute, (c) => adminController.listUsers(c))
  .openapi(updateUserRoleRoute, (c) => adminController.updateUserRole(c))
  .openapi(banUserRoute, (c) => adminController.banUser(c))
  .openapi(unbanUserRoute, (c) => adminController.unbanUser(c))
  .openapi(listCreatorsRoute, (c) => adminController.listCreators(c))
  .openapi(reviewCreatorRoute, (c) => adminController.reviewCreator(c))
  .openapi(updateCreatorRoute, (c) => adminController.updateCreator(c))
  .openapi(banCreatorRoute, (c) => adminController.banCreator(c))
  .openapi(unbanCreatorRoute, (c) => adminController.unbanCreator(c))
  .openapi(listCategoriesRoute, (c) => adminController.listCategories(c))
  .openapi(createCategoryRoute, (c) => adminController.createCategory(c))
  .openapi(updateCategoryRoute, (c) => adminController.updateCategory(c))
  .openapi(deleteCategoryRoute, (c) => adminController.deleteCategory(c))
  .openapi(listTagsRoute, (c) => adminController.listTags(c))
  .openapi(createTagRoute, (c) => adminController.createTag(c))
  .openapi(updateTagRoute, (c) => adminController.updateTag(c))
  .openapi(deleteTagRoute, (c) => adminController.deleteTag(c))
  .openapi(listPurchasesRoute, (c) => adminController.listPurchases(c))
  .openapi(getWebhookStatsRoute, (c) => adminController.getWebhookStats(c))
  .openapi(getCategoryByIdRoute, (c) => adminController.getCategoryById(c))
  .openapi(getDashboardStatsRoute, (c) => adminController.getDashboardStats(c));

export default chainedApp;
