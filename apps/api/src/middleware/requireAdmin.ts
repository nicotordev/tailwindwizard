import { getAuth } from "@hono/clerk-auth";
import type { Context, Next } from "hono";
import clerkClient from "../lib/clerkClient.js";

export const requireAdmin = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const user = await clerkClient.users.getUser(auth.userId);

  if (user.publicMetadata.role !== "ADMIN") {
    return c.json({ message: "Forbidden" }, 403);
  }

  // Store user in context for later use if needed
  c.set("user", user);

  await next();
};
