import Stripe from "stripe";
import env from "../config/env.config.js";

if (!env.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2025-12-15.clover", // Updated to match the expected version in types
  typescript: true,
  appInfo: {
    name: "TailwindWizard API",
    version: "1.0.0",
  },
});

export const stripeMetadataKeys = {
  purchaseId: "purchaseId",
  buyerId: "buyerId",
  creatorId: "creatorId",
} as const;

export default stripe;
