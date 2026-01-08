import { z } from "@hono/zod-openapi";

export const ReviewSchema = z
  .object({
    id: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().nullable(),
    body: z.string().nullable(),
    buyer: z
      .object({
        name: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      })
      .optional(),
    createdAt: z.string().or(z.date()),
  })
  .openapi("Review");

export const CreateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    title: z.string().optional(),
    body: z.string().optional(),
  })
  .openapi("CreateReview");
