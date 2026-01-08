import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { creatorController } from "../controllers/creator.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  CreateCreatorSchema,
  CreatorSchema,
  UpdateCreatorSchema,
} from "../schemas/creator.schema.js";

const creatorApp = new OpenAPIHono();

creatorApp.use("/me", requireAuth);

// --------------------------------------------------------------------------
// Routes
// --------------------------------------------------------------------------

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
  .openapi(getMeRoute, (c) => creatorController.getMe(c))
  .openapi(createMeRoute, (c) => creatorController.createMe(c))
  .openapi(updateMeRoute, (c) => creatorController.updateMe(c))
  .openapi(getByIdRoute, (c) => creatorController.getById(c));

export default chainedApp;
