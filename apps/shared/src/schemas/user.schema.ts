import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    role: z.enum(["ADMIN", "USER"]),
    createdAt: z.string().or(z.date()),
    // Add other fields as necessary
  })
  .openapi("User");

export const UpdateUserSchema = z
  .object({
    name: z.string().optional(),
    avatarUrl: z.string().optional(),
  })
  .openapi("UpdateUser");

export const ApiKeySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    scope: z.enum(["READ_PUBLIC", "DOWNLOAD_PURCHASED", "ADMIN"]),
    prefix: z.string(),
    lastUsedAt: z.string().nullable().or(z.date().nullable()),
    createdAt: z.string().or(z.date()),
  })
  .openapi("ApiKey");

export const CreateApiKeySchema = z
  .object({
    name: z.string().min(1),
    scope: z
      .enum(["READ_PUBLIC", "DOWNLOAD_PURCHASED", "ADMIN"])
      .default("READ_PUBLIC"),
  })
  .openapi("CreateApiKey");

export const NewApiKeyResponseSchema = ApiKeySchema.extend({
  key: z.string(),
}).openapi("NewApiKeyResponse");

// Simplified Purchase Schema for listing
export const UserPurchaseSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    totalAmount: z.string().or(z.number()), // Decimal often comes as string or number
    currency: z.string(),
    createdAt: z.string().or(z.date()),
    lineItems: z
      .array(
        z.object({
          block: z.object({
            id: z.string(),
            title: z.string(),
            slug: z.string(),
          }),
        })
      )
      .optional(),
  })
  .openapi("Purchase");

export type User = z.infer<typeof UserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
