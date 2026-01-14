import { z } from "@hono/zod-openapi";

export const PaginationMeta = z
  .object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
  .openapi("PaginationMeta");

export const MessageResponseSchema = z
  .object({
    message: z.string(),
  })
  .openapi("MessageResponse");

export const SuccessResponseSchema = z
  .object({
    success: z.boolean(),
  })
  .openapi("SuccessResponse");

export const UnauthorizedResponse = {
  description: "Unauthorized",
  content: {
    "application/json": {
      schema: MessageResponseSchema,
    },
  },
};

export const ForbiddenResponse = {
  description: "Forbidden",
  content: {
    "application/json": {
      schema: MessageResponseSchema,
    },
  },
};

export const NotFoundResponse = {
  description: "Not Found",
  content: {
    "application/json": {
      schema: MessageResponseSchema,
    },
  },
};

export const BadRequestResponse = {
  description: "Bad Request",
  content: {
    "application/json": {
      schema: MessageResponseSchema,
    },
  },
};
