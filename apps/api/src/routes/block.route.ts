import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { blockController } from "../controllers/block.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  BlockSchema,
  CreateBlockSchema,
  UpdateBlockSchema,
} from "../schemas/block.schema.js";
import { CreateReviewSchema, ReviewSchema } from "../schemas/review.schema.js";

const blockApp = new OpenAPIHono();

// Auth protection for mutations
blockApp.use("/", async (c, next) => {
  if (c.req.method === "POST") return requireAuth(c, next);
  return next();
});
blockApp.use("/:id", async (c, next) => {
  if (c.req.method === "PATCH" || c.req.method === "DELETE")
    return requireAuth(c, next);
  return next();
});
blockApp.use("/:id/reviews", async (c, next) => {
  if (c.req.method === "POST") return requireAuth(c, next);
  return next();
});

// --------------------------------------------------------------------------
// Routes
// --------------------------------------------------------------------------

// GET /blocks
const listBlocksRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Blocks"],
  summary: "List blocks",
  request: {
    query: z.object({
      limit: z.string().optional(),
      offset: z.string().optional(),
      search: z.string().optional(),
      status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
      creatorId: z.string().optional(),
      visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
      categorySlug: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(BlockSchema),
        },
      },
      description: "List of blocks",
    },
  },
});

// GET /blocks/{id}
const getBlockRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Blocks"],
  summary: "Get block details",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: BlockSchema,
        },
      },
      description: "Block details",
    },
    404: {
      description: "Not found",
    },
  },
});

// POST /blocks
const createBlockRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Blocks"],
  summary: "Create a new block",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateBlockSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: BlockSchema,
        },
      },
      description: "Block created",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Must be a creator",
    },
  },
});

// PATCH /blocks/{id}
const updateBlockRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Blocks"],
  summary: "Update a block",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateBlockSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: BlockSchema,
        },
      },
      description: "Block updated",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Forbidden",
    },
    404: {
      description: "Not found",
    },
  },
});

// DELETE /blocks/{id}
const deleteBlockRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Blocks"],
  summary: "Delete a block",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "Block deleted",
    },
    401: {
      description: "Unauthorized",
    },
    403: {
      description: "Forbidden",
    },
    404: {
      description: "Not found",
    },
  },
});

// GET /blocks/{id}/reviews
const listReviewsRoute = createRoute({
  method: "get",
  path: "/{id}/reviews",
  tags: ["Reviews"],
  summary: "List reviews for a block",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(ReviewSchema),
        },
      },
      description: "List of reviews",
    },
  },
});

// POST /blocks/{id}/reviews
const createReviewRoute = createRoute({
  method: "post",
  path: "/{id}/reviews",
  tags: ["Reviews"],
  summary: "Submit a review",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: CreateReviewSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ReviewSchema,
        },
      },
      description: "Review created",
    },
    401: {
      description: "Unauthorized",
    },
    409: {
      description: "Conflict (already reviewed)",
    },
  },
});

// --------------------------------------------------------------------------
// Implementation
// --------------------------------------------------------------------------

blockApp.openapi(listBlocksRoute, (c) => blockController.list(c));
blockApp.openapi(getBlockRoute, (c) => blockController.getById(c));
blockApp.openapi(createBlockRoute, (c) => blockController.create(c));
blockApp.openapi(updateBlockRoute, (c) => blockController.update(c));
blockApp.openapi(deleteBlockRoute, (c) => blockController.delete(c));

blockApp.openapi(listReviewsRoute, (c) => reviewController.listByBlock(c));
blockApp.openapi(createReviewRoute, (c) => reviewController.create(c));

export default blockApp;
