import { z } from "@hono/zod-openapi";

export const CategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    priority: z.number().default(0),
    isFeatured: z.boolean().default(false),
    _count: z
      .object({
        blocks: z.number(),
      })
      .optional(),
  })
  .openapi("Category");

export type Category = z.infer<typeof CategorySchema>;