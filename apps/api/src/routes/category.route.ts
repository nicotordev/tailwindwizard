import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { CategorySchema } from "@tw/shared";
import { categoryController } from "../controllers/category.controller.js";

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List all categories",
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(CategorySchema),
        },
      },
      description: "List of categories",
    },
  },
});

const getCategoryBySlugRoute = createRoute({
  method: "get",
  path: "/:slug",
  tags: ["Categories"],
  summary: "Get category by slug",
  request: {
    params: z.object({
      slug: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CategorySchema,
        },
      },
      description: "Category details",
    },
    404: {
      description: "Category not found",
    },
  },
});

const categoryApp = new OpenAPIHono();

const chainedApp = categoryApp
  .openapi(listCategoriesRoute, (c) => categoryController.list(c))
  .openapi(getCategoryBySlugRoute, (c) => categoryController.getBySlug(c));

export default chainedApp;
