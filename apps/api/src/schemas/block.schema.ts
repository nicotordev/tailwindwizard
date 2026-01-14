import { z } from "@hono/zod-openapi";

export const BundleUploadSchema = z.object({
  bundle: z.any().openapi({ type: "string", format: "binary" }),
});

export const BundleUploadResponseSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  sha256: z.string(),
  size: z.number(),
});

export const RenderJobSchema = z.object({
  id: z.string(),
  blockId: z.string(),
  status: z.enum(["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  error: z.string().nullable().optional(),
});
