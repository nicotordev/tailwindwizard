import { getAuth } from "@hono/clerk-auth";
import type { Context, Next } from "hono";
import clerkClient from "../lib/clerkClient.js";

export const requireAdmin = async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    console.error(
      `[AdminAuth] Unauthorized access attempt to ${c.req.path}. Auth object:`,
      {
        hasAuth: !!auth,
        userId: auth?.userId,
      }
    );
    return c.json({ message: "Unauthorized" }, 401);
  }

  const user = await clerkClient.users.getUser(auth.userId);

  if (user.publicMetadata.role !== "ADMIN") {
    console.warn(
      `[AdminAuth] Forbidden access attempt by user ${auth.userId} to ${c.req.path}`
    );
    return c.json({ message: "Forbidden" }, 403);
  }

  // Store user in context for later use if needed
  c.set("user", user);

  await next();
};
