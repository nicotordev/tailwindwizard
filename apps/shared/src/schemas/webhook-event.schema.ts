import { z } from "@hono/zod-openapi";
import { WebhookProvider, WebhookStatus } from "../types/prisma.js";

export const WebhookEventSchema = z
  .object({
    id: z.string(),
    provider: z.nativeEnum(WebhookProvider),
    status: z.nativeEnum(WebhookStatus),
    externalId: z.string(),
    eventType: z.string(),
    payload: z.any(),
    receivedAt: z.string().or(z.date()),
    processedAt: z.string().or(z.date()).nullable(),
    error: z.string().nullable(),
    createdAt: z.string().or(z.date()),
    updatedAt: z.string().or(z.date()),
  })
  .openapi("WebhookEvent");

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;
