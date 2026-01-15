import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { collectionController } from "../controllers/collection.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  CollectionSchema,
  CreateCollectionSchema,
  UpdateCollectionSchema,
} from "@tw/shared";

const collectionApp = new OpenAPIHono();

// Auth protection
collectionApp.use("/", async (c, next) => {
  if (c.req.method === "POST") return requireAuth(c, next);
  return next();
});

collectionApp.use("/:id", async (c, next) => {
    if (c.req.method === "PATCH" || c.req.method === "DELETE") return requireAuth(c, next);
    return next();
});

collectionApp.use("/:id/blocks/:blockId", async (c, next) => {
    return requireAuth(c, next);
});

// --------------------------------------------------------------------------
// Routes
// --------------------------------------------------------------------------

// GET /collections
const listCollectionsRoute = createRoute({
  method: "get",
  path: "/",
  middleware: [requireAuth],
  tags: ["Collections"],
  summary: "List my collections",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(CollectionSchema),
        },
      },
      description: "List of collections",
    },
    401: { description: "Unauthorized" },
  },
});

// GET /collections/{id}
const getCollectionRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Collections"],
  summary: "Get collection details",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CollectionSchema, // Note: response includes blocks if implemented in service/controller
        },
      },
      description: "Collection details",
    },
    404: { description: "Not found" },
  },
});

// POST /collections
const createCollectionRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Collections"],
  summary: "Create a new collection",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCollectionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CollectionSchema,
        },
      },
      description: "Collection created",
    },
    401: { description: "Unauthorized" },
  },
});

// PATCH /collections/{id}
const updateCollectionRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Collections"],
  summary: "Update a collection",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCollectionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CollectionSchema,
        },
      },
      description: "Collection updated",
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

// DELETE /collections/{id}
const deleteCollectionRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Collections"],
  summary: "Delete a collection",
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
      description: "Collection deleted",
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

// POST /collections/{id}/blocks/{blockId}
const addBlockRoute = createRoute({
  method: "post",
  path: "/{id}/blocks/{blockId}",
  tags: ["Collections"],
  summary: "Add block to collection",
  request: {
    params: z.object({
      id: z.string(),
      blockId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "Block added",
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

// DELETE /collections/{id}/blocks/{blockId}
const removeBlockRoute = createRoute({
  method: "delete",
  path: "/{id}/blocks/{blockId}",
  tags: ["Collections"],
  summary: "Remove block from collection",
  request: {
    params: z.object({
      id: z.string(),
      blockId: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
      description: "Block removed",
    },
    401: { description: "Unauthorized" },
    404: { description: "Not found" },
  },
});

const chainedApp = collectionApp
  .openapi(listCollectionsRoute, (c) => collectionController.listMy(c))
  .openapi(getCollectionRoute, (c) => collectionController.getById(c))
  .openapi(createCollectionRoute, (c) => collectionController.create(c))
  .openapi(updateCollectionRoute, (c) => collectionController.update(c))
  .openapi(deleteCollectionRoute, (c) => collectionController.delete(c))
  .openapi(addBlockRoute, (c) => collectionController.addBlock(c))
  .openapi(removeBlockRoute, (c) => collectionController.removeBlock(c));

export default chainedApp;
