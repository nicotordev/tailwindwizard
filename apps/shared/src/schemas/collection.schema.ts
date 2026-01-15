import { z } from "@hono/zod-openapi";

export const CollectionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).default("PRIVATE"),
    userId: z.string(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    _count: z
      .object({
        blocks: z.number(),
      })
      .optional(),
  })
  .openapi("Collection");

export const CreateCollectionSchema = z
  .object({
    name: z.string().min(3).max(50),
    description: z.string().max(500).optional(),
    visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).default("PRIVATE"),
  })
  .openapi("CreateCollection");

export const UpdateCollectionSchema = CreateCollectionSchema.partial().openapi("UpdateCollection");

export type Collection = z.infer<typeof CollectionSchema>;
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
