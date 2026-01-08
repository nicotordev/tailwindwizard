// src/config/env.config.ts
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
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
} as const;

export default env;
