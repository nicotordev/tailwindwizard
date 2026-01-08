import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
    await auth.protect({
      role: "admin",
    });
    return NextResponse.next();
  }
  if (marketRoutes(req)) {
    await auth.protect({
      role: "user",
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
