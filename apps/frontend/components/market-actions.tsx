import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function MarketActions({ children }: { children?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-xl px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between transition-all hover:border-border/80">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {children}
        <Button
          asChild
          size="sm"
          className="gap-2 rounded-xl px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all font-semibold"
        >
          <Link href="/dashboard/forgery/blocks/new">
            <PackagePlus className="size-4" />
            Publish Block
          </Link>
        </Button>
      </div>
    </section>
  );
}
