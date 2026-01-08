import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { tagController } from "../controllers/tag.controller.js";
import { TagSchema } from "@tw/shared";

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

const tagApp = new OpenAPIHono();

const chainedApp = tagApp
  .openapi(listTagsRoute, (c) => tagController.list(c));

export default chainedApp;
