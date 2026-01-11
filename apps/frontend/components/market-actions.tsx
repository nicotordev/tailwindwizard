import * as React from "react";
import { Activity, PackagePlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function MarketActions({ children }: { children?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-xl px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between transition-all hover:border-border/80">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-border/60 bg-muted/20 px-4 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
            Active blocks
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border/60 bg-muted/20 px-4 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
            Validation history
          </Button>
        </div>
        <Separator orientation="vertical" className="hidden h-8 lg:block bg-border/40" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Zero-trust active</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            <Activity className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Pipeline: Queued</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {children}
        <Badge variant="secondary" className="hidden sm:inline-flex rounded-lg bg-secondary/50 text-secondary-foreground/80 border-secondary-foreground/10">
          Stripe Connect Express
        </Badge>
        <Button size="sm" className="gap-2 rounded-xl px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all font-semibold">
          <PackagePlus className="size-4" />
          Publish Block
        </Button>
      </div>
    </section>
  );
}
