import { z } from "@hono/zod-openapi";

export const TagSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    _count: z
      .object({
        blocks: z.number(),
      })
      .optional(),
  })
  .openapi("Tag");

export type Tag = z.infer<typeof TagSchema>;