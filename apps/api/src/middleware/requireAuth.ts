import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requireAuth = async (c: Context<any>, next: () => Promise<void>) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};
