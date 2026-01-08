import { z } from "@hono/zod-openapi";

export const PreviewAssetSchema = z
  .object({
    id: z.string(),
    viewport: z.enum(["MOBILE", "TABLET", "DESKTOP"]),
    url: z.string(),
    width: z.number(),
    height: z.number(),
  })
  .openapi("PreviewAsset");

export const BlockTagSchema = z
  .object({
    tag: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  })
  .openapi("BlockTag");

export const BlockSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    type: z.enum(["COMPONENT", "SECTION", "PAGE"]),
    framework: z.enum(["REACT", "VUE", "SVELTE"]),
    stylingEngine: z.enum(["TAILWIND", "CSS"]),
    version: z.string(),
    visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]),
    status: z.enum([
      "DRAFT",
      "SUBMITTED",
      "APPROVED",
      "REJECTED",
      "PUBLISHED",
      "UNPUBLISHED",
      "ARCHIVED",
    ]),
    price: z.string().or(z.number()),
    currency: z.enum(["USD", "EUR", "CLP", "GBP", "MXN", "ARS", "BRL"]),

    // Relations
    creator: z
      .object({
        displayName: z.string().nullable(),
        user: z
          .object({
            avatarUrl: z.string().nullable(),
          })
          .optional(),
      })
      .optional(),

    previews: z.array(PreviewAssetSchema).optional(),
    tags: z.array(BlockTagSchema).optional(),

    soldCount: z.number(),
    ratingAvg: z.number(),
    ratingCount: z.number(),

    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    publishedAt: z.string().or(z.date()).nullable(),
  })
  .openapi("Block");

// Request Schemas
export const CreateBlockSchema = z
  .object({
    title: z.string().min(3),
    slug: z
      .string()
      .min(3)
      .regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    type: z.enum(["COMPONENT", "SECTION", "PAGE"]).default("COMPONENT"),
    price: z.number().min(0),
    currency: z.enum(["USD"]).default("USD"), // limit for now
    framework: z.enum(["REACT", "VUE", "SVELTE"]).default("REACT"),
    stylingEngine: z.enum(["TAILWIND", "CSS"]).default("TAILWIND"),
    visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
  })
  .openapi("CreateBlock");

export const UpdateBlockSchema =
  CreateBlockSchema.partial().openapi("UpdateBlock");
