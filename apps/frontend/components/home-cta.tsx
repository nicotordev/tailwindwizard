import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomeCta() {
  return (
    <>
      {/* Global CTA Section */}
      <div className="mt-24 relative overflow-hidden rounded-[2.5rem] bg-foreground p-8 sm:p-16 text-background">
        {/* Subtle patterns for premium feel */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <h3 className="text-3xl font-bold font-heading sm:text-4xl mb-4">
              Stop building for free. <br />
              <span className="text-primary-foreground/80">
                Start your block empire today.
              </span>
            </h3>
            <p className="text-lg text-background/70 leading-relaxed">
              Join hundreds of developers who are already turning their
              component libraries into a reliable revenue stream.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              size="xl"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 group"
              asChild
            >
              <Link href="/sell">
                Apply to Sell
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-background/20 hover:bg-background/10 rounded-2xl bg-transparent"
              asChild
            >
              <Link href="/market">Browse Library</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
