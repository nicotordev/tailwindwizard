import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";

export const requireAuth = async (c: Context, next: () => Promise<void>) => {
  const auth = getAuth(c);
  if (!auth || (auth && !auth.userId)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return await next();
};
