import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Grid2X2, ListFilter, ShieldCheck, Search } from "lucide-react";

type MarketSidebarProps = { mode: "sheet" | "static"; search: string; onSearchChange: (value: string) => void; games: string[] };

function SidebarContent({ search, onSearchChange, games }: Omit<MarketSidebarProps, "mode">) {
  return (
    <div className="flex flex-col gap-5">
      <Card className="rounded-[1.5rem] border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <div>
            <div className="text-sm font-bold font-heading uppercase tracking-wider text-foreground/70">Search</div>
            <p className="text-xs text-muted-foreground mt-1">Filter by block name or technology.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search blocks..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9 h-10 rounded-xl bg-muted/20 border-border/40 focus-visible:ring-primary/20"
              aria-label="Search blocks"
              data-testid="market-search"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-[1.5rem] border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <div>
            <div className="text-sm font-bold font-heading uppercase tracking-wider text-foreground/70">Advanced</div>
            <p className="text-xs text-muted-foreground mt-1">Refine your marketplace view.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="filters" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-semibold hover:no-underline hover:text-primary transition-colors">
                Strategic Filters
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Block type</span>
                  <Select defaultValue="component">
                    <SelectTrigger className="w-full h-9 rounded-lg bg-muted/20 border-border/40"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="component">Component</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Render engine</span>
                  <Select defaultValue="playwright">
                    <SelectTrigger className="w-full h-9 rounded-lg bg-muted/20 border-border/40"><SelectValue placeholder="Engine" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="playwright">Playwright</SelectItem>
                      <SelectItem value="satori">Satori</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                  <ShieldCheck className="size-3.5" />
                  AST Validation Active
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardContent className="space-y-4 p-5">
          <div>
            <div className="text-sm font-bold font-heading uppercase tracking-wider text-foreground/70">Categories</div>
            <p className="text-xs text-muted-foreground mt-1">Priority market segments.</p>
          </div>
          <ScrollArea className="h-48 pr-3">
            <div className="space-y-2">
              {games.map((game) => (
                <button key={game} className="group w-full flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 px-3 py-2 text-sm transition-all hover:bg-primary/5 hover:border-primary/20">
                  <span className="flex items-center gap-2 font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <Grid2X2 className="size-4 opacity-50" />
                    {game}
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5 opacity-0 group-hover:opacity-100 transition-opacity">View</Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
          <Button variant="ghost" size="sm" className="w-full rounded-lg text-xs text-muted-foreground hover:text-primary">Show more</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function MarketSidebar({ mode, search, onSearchChange, games }: MarketSidebarProps) {
  if (mode === "sheet")
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl"><ListFilter className="size-4" />Filters</Button>
        </SheetTrigger>
        <SheetContent side="right" className="gap-6 rounded-l-[2rem] border-l-border/50 bg-background/95 backdrop-blur-xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="font-heading text-2xl">Exploration Panel</SheetTitle>
            <SheetDescription>Refine your marketplace view.</SheetDescription>
          </SheetHeader>
          <SidebarContent search={search} onSearchChange={onSearchChange} games={games} />
        </SheetContent>
      </Sheet>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight">Control Panel</h2>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold opacity-60">Discovery & Validation</p>
      </div>
      <SidebarContent search={search} onSearchChange={onSearchChange} games={games} />
    </div>
  );
}
