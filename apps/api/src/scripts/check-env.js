import { z } from "zod";

export const envConfigSchema = z.object({
  clerkSecretKey: z.string().min(1, "Missing CLERK_SECRET_KEY"),
  clerkPublishableKey: z.string().min(1, "Missing CLERK_PUBLISHABLE_KEY"),
  stripeSecretKey: z.string().min(1, "Missing STRIPE_SECRET_KEY"),
});

const result = envConfigSchema.safeParse({
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
});

if (!result.success) {
  console.error("❌ Invalid environment variables configuration:");
  result.error.issues.forEach((issue) => {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exitCode = 1;
} else {
  console.log("✅ Environment variables are valid and ready to go! 🚀");
}
