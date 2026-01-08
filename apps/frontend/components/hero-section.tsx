import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Blocks, CreditCard, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Magical background glow */}
      <div className="absolute left-1/2 top-[-20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px] z-10" />
      <div className="absolute right-[-10%] bottom-[-20%] h-[420px] w-[420px] rounded-full bg-secondary/60 blur-[160px] z-10" />

      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6">
            The Block Economy for Shadcn & Tailwind
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-7xl font-heading leading-[1.1]">
            Buy & sell premium
            <span className="text-primary"> Tailwind blocks</span>
            <br />
            without leaking code
          </h1>

          <p className="mt-6 text-lg text-muted-foreground">
            TailwindWizard is a zero-trust marketplace for Shadcn-based UI
            components. Preview visually. Unlock source only after purchase.
            Secure by design.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/market">Explore the marketplace</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sell">Start selling blocks</Link>
            </Button>
          </div>
        </div>

        {/* Value pillars */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <Shield className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-bold font-heading text-lg">
              Zero-Trust Preview
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No source code is ever sent to the browser. Previews are rendered
              server-side and delivered as snapshots.
            </p>
          </Card>

          <Card className="p-6">
            <Blocks className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-bold font-heading text-lg">
              Shadcn-Native Blocks
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Built on top of Shadcn primitives. Copy-paste friendly. No hidden
              abstractions or vendor lock-in.
            </p>
          </Card>

          <Card className="p-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-bold font-heading text-lg">
              AST-Validated Code
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every block is statically analyzed to prevent unsafe patterns,
              malicious imports, or supply-chain surprises.
            </p>
          </Card>

          <Card className="p-6">
            <CreditCard className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-bold font-heading text-lg">
              Stripe-Backed Marketplace
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sellers get paid through Stripe Connect Express. Global payouts,
              KYC handled, compliance included.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
