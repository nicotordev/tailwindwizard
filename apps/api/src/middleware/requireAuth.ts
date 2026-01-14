import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";

export const requireAuth = async (c: Context, next: () => Promise<void>) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    console.error(
      `[Auth] Unauthorized access attempt to ${c.req.path}. Auth object:`,
      {
        hasAuth: !!auth,
        userId: auth?.userId,
        sessionId: auth?.sessionId,
      }
    );
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};
