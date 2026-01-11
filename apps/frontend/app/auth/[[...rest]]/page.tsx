import SignInForm from "@/components/auth/sign-in-form";
import SignUpForm from "@/components/auth/sign-up-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Shield, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

interface PageProps {
  params: Promise<{ rest?: string[] }>;
}

export default async function AuthPage({
  params,
}: PageProps): Promise<ReactElement> {
  const { rest } = await params;

  const isSignIn = rest?.includes("sign-in") ?? false;
  const isSignUp = rest?.includes("sign-up") ?? false;

  if (!isSignIn && !isSignUp) {
    redirect("/auth/sign-in");
  }

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
              <h1 className="text-balance font-heading text-5xl font-bold tracking-tight leading-[1.08] text-foreground">
                {isSignUp ? "Join the" : "Access the"}
                <br />
                <span className="bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Block Economy
                </span>{" "}
                ✨
              </h1>

              <p className="mt-6 max-w-md text-lg text-muted-foreground leading-relaxed">
                TailwindWizard is not a gallery—it’s{" "}
                <span className="text-foreground/90 font-medium">
                  marketplace infrastructure
                </span>
                . Buy and sell premium Shadcn/Tailwind blocks with{" "}
                <span className="text-foreground/90 font-medium">
                  Zero-Trust previews
                </span>{" "}
                and verified delivery.
              </p>

              <div className="mt-12 space-y-6">
                <div className="group flex items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-3 transition-colors group-hover:bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-heading">
                      Zero-Trust Preview
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Previews ship as snapshots—not source code—until payment
                      is confirmed.
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-3 transition-colors group-hover:bg-secondary/10">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-heading">
                      Verified Blocks
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Static analysis + dependency checks to reduce “mystery
                      imports” and spaghetti code.
                    </p>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="rounded-2xl border border-border/60 bg-background/30 p-3 transition-colors group-hover:bg-primary/10">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground font-heading">
                      Payouts via Stripe Connect
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Built for global seller onboarding, compliance, and
                      marketplace-grade fund flows.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center gap-4">
              <Button size="lg" className="rounded-2xl px-8" asChild>
                <Link href="/market" className="flex items-center gap-2">
                  Explore marketplace <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-border/70 bg-background/35 hover:bg-background/55"
                asChild
              >
                <Link href="/docs">Read the architecture</Link>
              </Button>
            </div>
          </div>

          {/* Right: Auth form */}
          <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/7 via-transparent to-background/60" />
            <div className="w-full max-w-md space-y-8">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="xl:hidden mb-4">
                  <div className="h-16 w-16 rounded-3xl border border-border/70 bg-primary/12 flex items-center justify-center shadow-2xl shadow-primary/10">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                {isSignUp ? <SignUpForm /> : <SignInForm />}
              </div>

              <div className="space-y-6">
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
                  By continuing, you agree to the{" "}
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
