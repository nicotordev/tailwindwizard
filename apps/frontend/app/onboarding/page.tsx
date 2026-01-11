import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, Shield, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // If user metadata says already onboarded, redirect to dashboard
  if (user?.publicMetadata?.onboardingComplete) {
    redirect("/dashboard");
  }

  // Serialize user data for Client Component
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses[0]?.emailAddress,
    imageUrl: user.imageUrl,
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background: shadcn-only, marketplace-grade atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft glows (theme aware) */}
        <div className="absolute left-1/2 top-[-22%] h-215 w-215 -translate-x-1/2 rounded-full bg-primary/18 blur-[170px] opacity-70" />
        <div className="absolute right-[-14%] bottom-[-16%] h-205 w-205 rounded-full bg-secondary/20 blur-[190px] opacity-60" />

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-background/75 to-background" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/45 shadow-2xl backdrop-blur-2xl xl:grid-cols-2">
          {/* Left: Product narrative aligned with the briefing */}
          <div className="relative hidden flex-col justify-between overflow-hidden p-12 xl:flex border-r border-border/60">
            {/* Visual layer */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-linear-to-tr from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/75" />
            </div>

            <div className="relative">
              {/* Back Home Link */}
              <Link
                href="/"
                className="group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground mb-8 "
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Back home
                </span>
              </Link>

              <div className="mb-6">
                <Badge
                  variant="outline"
                  className="px-4 py-1 border-primary/30 text-primary font-semibold tracking-widest uppercase text-[10px]"
                >
                  Onboarding Step
                </Badge>
              </div>

              <h1 className="text-balance font-heading text-5xl font-bold tracking-tight leading-[1.08] text-foreground">
                Finalize your
                <br />
                <span className="bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent italic">
                  Wizard Profile
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg text-muted-foreground leading-relaxed">
                You&apos;re almost there! Help us personalize your experience.{" "}
                <span className="text-foreground/90 font-medium">
                  Set up your identity
                </span>{" "}
                to start exploring the block economy.
              </p>

              <div className="mt-12 space-y-6">
                <div className="group flex items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-3 transition-colors group-hover:bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-heading">
                      Role Selection
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Choose whether you&apos;ll be creating magic or building
                      with it.
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-3 transition-colors group-hover:bg-secondary/10">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-heading">
                      Verified Identity
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Global payout infrastructure for creators powered by
                      Stripe.
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-3 transition-colors group-hover:bg-primary/10">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-heading">
                      Instant Access
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complete the ritual and get access to the dashboard
                      immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
                Joined as{" "}
                <span className="text-foreground font-bold">
                  {user.emailAddresses[0].emailAddress}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Onboarding Wizard */}
          <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/7 via-transparent to-background/60" />
            <div className="w-full max-w-md space-y-8">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="xl:hidden mb-4">
                  <div className="h-16 w-16 rounded-3xl border border-border/70 bg-primary/12 flex items-center justify-center shadow-2xl shadow-primary/10">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold font-heading">The Ritual</h2>
                <p className="text-muted-foreground text-sm">
                  Follow the steps to complete your profile
                </p>
              </div>

              <div className="relative">
                <OnboardingWizard initialUser={serializedUser} />
              </div>

              <div className="space-y-6 pt-4">
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
                  By completing setup, you agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline underline-offset-4"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
