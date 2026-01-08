import type { Context } from "hono";
import { tagService } from "../services/tag.service.js";

export const tagController = {
  async list(c: Context) {
    const tags = await tagService.listAll();
    return c.json(tags, 200);
  },
};
