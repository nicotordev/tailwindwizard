import { Badge } from "@/components/ui/badge";

export function MarketHero() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl px-8 py-12 sm:px-12 sm:py-16">
      {/* Magical background glows */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/40 blur-[100px]" />
      
      <div className="relative flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
          Marketplace Architecture
        </Badge>
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance leading-[1.1]">
          Protected UI <span className="text-primary italic">Marketplace</span> 🔮
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Layer-2 infrastructure for publishing and commercializing
          Shadcn blocks with zero-trust previews and automated financial flows.
        </p>
      </div>
    </section>
  );
}
