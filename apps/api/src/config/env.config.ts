// src/config/env.config.ts
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
  ONESIGNAL_APP_ID: z.string().min(1).optional(),
  ONESIGNAL_API_KEY: z.string().min(1).optional(),
  // R2 Config
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // Zod error is safe to print
  throw new Error(`Invalid env: ${parsed.error.message}`);
}

const env = {
  databaseUrl: parsed.data.DATABASE_URL,
  stripeSecretKey: parsed.data.STRIPE_SECRET_KEY,
  stripeWebhookSecret: parsed.data.STRIPE_WEBHOOK_SECRET,
  frontendUrl: parsed.data.FRONTEND_URL,
  oneSignalAppId: parsed.data.ONESIGNAL_APP_ID,
  oneSignalApiKey: parsed.data.ONESIGNAL_API_KEY,
  r2: {
    accessKeyId: parsed.data.R2_ACCESS_KEY_ID,
    secretAccessKey: parsed.data.R2_SECRET_ACCESS_KEY,
    accountId: parsed.data.R2_ACCOUNT_ID,
    bucketName: parsed.data.R2_BUCKET_NAME,
    publicUrl: parsed.data.R2_PUBLIC_URL,
    endpoint: `https://${parsed.data.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  },
} as const;

export default env;
