import { z } from "@hono/zod-openapi";

export const CreatorSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    displayName: z.string().nullable(),
    bio: z.string().nullable(),
    websiteUrl: z.string().nullable(),
    portfolioUrl: z.string().nullable(),
    countryCode: z.string().nullable(),
    stripeAccountStatus: z.string(), // simplified enum
    isApprovedSeller: z.boolean(),
    createdAt: z.string().or(z.date()),
  })
  .openapi("Creator");

export const CreateCreatorSchema = z
  .object({
    displayName: z.string().optional(),
    bio: z.string().optional(),
    websiteUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    countryCode: z.string().length(2).optional(),
  })
  .openapi("CreateCreator");

export const UpdateCreatorSchema = CreateCreatorSchema.openapi("UpdateCreator");
