import { UserProfile } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import HomeHeader from "@/components/layout/home-header";
import HomeFooter from "@/components/layout/home-footer";

export default function UserProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1 relative isolate overflow-hidden">
        {/* Background: similar to Auth but more subtle */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-background" />
        <div className="pointer-events-none absolute left-1/2 top-[-10%] -z-10 h-150 w-150 -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <h1 className="text-3xl font-bold font-heading tracking-tight">Account Settings</h1>
              <Badge variant="outline">Clerk</Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Manage your profile, security, and linked accounts.
            </p>
          </div>

          <div className="flex justify-center md:justify-start">
            <UserProfile
              path="/profile"
              routing="path"
              appearance={{
                variables: {
                  borderRadius: "0.9rem",
                  colorPrimary: "hsl(var(--primary))",
                },
                elements: {
                  rootBox: "w-full max-w-5xl",
                  card: "shadow-xl border bg-card/40 backdrop-blur pb-10",
                  navbar: "bg-transparent border-r",
                  scrollBox: "bg-transparent",
                  pageScrollBox: "bg-transparent",
                  profileSectionTitleText: "font-heading font-semibold",
                  headerTitle: "font-heading font-bold",
                  headerSubtitle: "text-muted-foreground",
                  breadcrumbsItem: "text-muted-foreground",
                  breadcrumbsItem__active: "text-foreground font-medium",
                  userPreviewMainIdentifier: "font-semibold",
                  userPreviewSecondaryIdentifier: "text-muted-foreground",
                }
              }}
            />
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
