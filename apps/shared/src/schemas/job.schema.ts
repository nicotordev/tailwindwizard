import { z } from "@hono/zod-openapi";

export const RenderJobSchema = z
  .object({
    id: z.string(),
    blockId: z.string(),
    status: z.enum(["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED"]),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
    error: z.string().nullable().optional(),
  })
  .openapi("RenderJob");
