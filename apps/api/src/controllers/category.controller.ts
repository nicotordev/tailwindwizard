import type { Context } from "hono";
import { categoryService } from "../services/category.service.js";

export const categoryController = {
  async list(c: Context) {
    const categories = await categoryService.listAll();
    return c.json(categories, 200);
  },

  async getBySlug(c: Context) {
    const slug = c.req.param("slug");
    const category = await categoryService.findBySlug(slug);
    if (!category) {
      return c.json({ message: "Category not found" }, 404);
    }
    return c.json(category, 200);
  },
};
