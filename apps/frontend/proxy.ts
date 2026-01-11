import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const homeMatcher = createRouteMatcher(["/"]);
const adminMatcher = createRouteMatcher(["/admin"]);
const marketRoutes = createRouteMatcher([
  "/marketplace/buy",
  "/marketplace/sell",
]);

export default clerkMiddleware(async (auth, req) => {
  if (homeMatcher(req)) {
    return NextResponse.next();
  }
  if (adminMatcher(req)) {
    const _auth = await auth();
    const _clerkClient = await clerkClient();
    const user = await _clerkClient.users.getUser(_auth.userId!);
    const role = user.publicMetadata?.role as string | undefined;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }
  if (marketRoutes(req)) {
    await auth.protect({
      role: "USER",
    });
    return NextResponse.next();
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
