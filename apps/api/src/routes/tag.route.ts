import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { tagController } from "../controllers/tag.controller.js";
import { TagSchema } from "../schemas/tag.schema.js";

const tagApp = new OpenAPIHono();

const listTagsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tags"],
  summary: "List all tags",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(TagSchema),
        },
      },
      description: "List of tags",
    },
  },
});

tagApp.openapi(listTagsRoute, tagController.list);

export default tagApp;
