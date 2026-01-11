import { z } from "@hono/zod-openapi";

export const CategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    icon: z.string().nullable().optional(),
    _count: z
      .object({
        blocks: z.number(),
      })
      .optional(),
  })
  .openapi("Category");

export type Category = z.infer<typeof CategorySchema>;
