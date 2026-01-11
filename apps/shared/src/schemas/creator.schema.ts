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

export const CreatorOnboardingSchema = z.object({
  returnUrl: z.string().url(),
  refreshUrl: z.string().url(),
});

export const CreatorOnboardingResponseSchema = z.object({
  url: z.string().url(),
});

export type Creator = z.infer<typeof CreatorSchema>;
export type CreateCreatorInput = z.infer<typeof CreateCreatorSchema>;
export type UpdateCreatorInput = z.infer<typeof UpdateCreatorSchema>;
export type CreatorOnboardingInput = z.infer<typeof CreatorOnboardingSchema>;
