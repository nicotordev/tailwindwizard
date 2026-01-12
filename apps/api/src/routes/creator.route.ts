import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { creatorController } from "../controllers/creator.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  CreateCreatorSchema,
  CreatorSchema,
  UpdateCreatorSchema,
  CreatorOnboardingSchema,
  CreatorOnboardingResponseSchema,
  BlockSchema,
  GetMyBlocksQuerySchema,
} from "@tw/shared";

const creatorApp = new OpenAPIHono();

creatorApp.use("/me", requireAuth);
creatorApp.use("/me/*", requireAuth);

const PaginationMeta = z
  .object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
  .openapi("PaginationMeta");

// --------------------------------------------------------------------------
// Routes
// --------------------------------------------------------------------------

// GET /me/blocks
const getMyBlocksRoute = createRoute({
  method: "get",
  path: "/me/blocks",
  tags: ["Creator"],
  summary: "Get my blocks",
  request: {
    query: GetMyBlocksQuerySchema,
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
      description: "List of my blocks",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Creator profile not found",
    },
  },
});

// GET /me
const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Creator"],
  summary: "Get my creator profile",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CreatorSchema,
        },
      },
      description: "Creator profile",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Not found",
    },
  },
});

// POST /me/onboarding
const onboardMeRoute = createRoute({
  method: "post",
  path: "/me/onboarding",
  tags: ["Creator"],
  summary: "Onboard with Stripe",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatorOnboardingSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CreatorOnboardingResponseSchema,
        },
      },
      description: "Onboarding Link",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

// POST /me
const createMeRoute = createRoute({
  method: "post",
  path: "/me",
  tags: ["Creator"],
  summary: "Become a creator",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCreatorSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CreatorSchema,
        },
      },
      description: "Creator profile created",
    },
    401: {
      description: "Unauthorized",
    },
    409: {
      description: "Already exists",
    },
  },
});

// PATCH /me
const updateMeRoute = createRoute({
  method: "patch",
  path: "/me",
  tags: ["Creator"],
  summary: "Update my creator profile",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateCreatorSchema,
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
      description: "Creator profile updated",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Not found",
    },
  },
});

const getByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Creator"],
  summary: "Get creator by ID",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CreatorSchema,
        },
      },
      description: "Creator Found",
    },
    404: {
      description: "Not Found",
    },
  },
});

// --------------------------------------------------------------------------
// Implementation
// --------------------------------------------------------------------------

const chainedApp = creatorApp
  .openapi(getMyBlocksRoute, (c) => creatorController.getMyBlocks(c))
  .openapi(getMeRoute, (c) => creatorController.getMe(c))
  .openapi(onboardMeRoute, (c) => creatorController.onboardMe(c))
  .openapi(createMeRoute, (c) => creatorController.createMe(c))
  .openapi(updateMeRoute, (c) => creatorController.updateMe(c))
  .openapi(getByIdRoute, (c) => creatorController.getById(c));

export default chainedApp;
