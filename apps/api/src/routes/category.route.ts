import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { categoryController } from "../controllers/category.controller.js";
import { CategorySchema } from "../schemas/category.schema.js";

const categoryApp = new OpenAPIHono();

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List all categories",
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

categoryApp.openapi(listCategoriesRoute, (c) => categoryController.list(c));
categoryApp.openapi(getCategoryBySlugRoute, (c) => categoryController.getBySlug(c));

export default categoryApp;
