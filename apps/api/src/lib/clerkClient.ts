import { createClerkClient } from "@clerk/backend";
import env from "../config/env.config.js";

const clerkClient = createClerkClient({
  secretKey: env.clerk.secretKey,
  publishableKey: env.clerk.publishableKey,
});

export default clerkClient;
