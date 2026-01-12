import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isHome = createRouteMatcher(["/"]);
const isAdmin = createRouteMatcher(["/admin(.*)"]);
const isOnboarding = createRouteMatcher(["/onboarding(.*)"]);
const isMarketProtected = createRouteMatcher([
  "/market/buy(.*)",
  "/market/sell(.*)",
]);

type Role = "ADMIN" | "USER";

function getRoleFromPublicMetadata(meta: unknown): Role | null {
  if (typeof meta !== "object" || meta === null) return null;
  const record = meta as Record<string, unknown>;
  const role = record["role"];
  if (role === "ADMIN" || role === "USER") return role;
  return null;
}

function redirectTo(req: NextRequest, pathname: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export default clerkMiddleware(async (auth, req) => {
  // ✅ Let the home page always through (no auth, no user fetch)
  if (isHome(req)) return NextResponse.next();

  // ---- Market protected routes: require signed-in and role USER (or higher, depending on your Clerk setup)
  if (isMarketProtected(req)) {
    await auth.protect({ role: "USER" });
    return NextResponse.next();
  }

  // ---- Admin routes: require signed-in + ADMIN
  if (isAdmin(req)) {
    const a = await auth();
    if (!a.userId) return redirectTo(req, "/");

    const client = await clerkClient();
    const user = await client.users.getUser(a.userId);
    const role = getRoleFromPublicMetadata(user.publicMetadata);

    if (role !== "ADMIN") return redirectTo(req, "/");
    return NextResponse.next();
  }

  // ---- Onboarding gate: if signed in but missing role, force /onboarding
  // Important: only applies to signed-in users; anonymous users pass through (unless other protections exist)
  if (!isOnboarding(req)) {
    const a = await auth();
    if (a.userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(a.userId);
      const role = getRoleFromPublicMetadata(user.publicMetadata);

      if (role === null) return redirectTo(req, "/onboarding");
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
