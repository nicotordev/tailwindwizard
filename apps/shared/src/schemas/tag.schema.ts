import { z } from "@hono/zod-openapi";

export const TagSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    icon: z.string().nullable().optional(),
    iconType: z.enum(["IMAGE", "LUCIDE", "REACT_ICON", "EMOJI"]).default("IMAGE"),
    description: z.string().nullable().optional(),
    _count: z
      .object({
        blocks: z.number(),
      })
      .optional(),
  })
  .openapi("Tag");

export type Tag = z.infer<typeof TagSchema>;