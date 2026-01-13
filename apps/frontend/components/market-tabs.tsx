import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MarketTabsProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MarketTabs({ value, onChange }: MarketTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList
        className="w-full justify-start gap-2 overflow-x-auto bg-transparent h-auto p-0"
        aria-label="Market sections"
      >
        <TabsTrigger
          key="all-blocks"
          value="all-blocks"
          className="relative whitespace-nowrap px-6 py-2.5 rounded-xl transition-all duration-300
              data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.1)]
              data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground
              font-semibold text-sm group"
        >
          <span className="relative z-10">All Blocks</span>
          <div className="absolute inset-0 rounded-xl border border-transparent group-data-[state=active]:border-primary/20 transition-colors" />
        </TabsTrigger>
        <TabsTrigger
          key="activity"
          value="activity"
          className="relative whitespace-nowrap px-6 py-2.5 rounded-xl transition-all duration-300
              data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.1)]
              data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground
              font-semibold text-sm group"
        >
          <span className="relative z-10">Latest Activity</span>
          <div className="absolute inset-0 rounded-xl border border-transparent group-data-[state=active]:border-primary/20 transition-colors" />
        </TabsTrigger>
        <TabsTrigger
          key="most-sold"
          value="most-sold"
          className="relative whitespace-nowrap px-6 py-2.5 rounded-xl transition-all duration-300
              data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_rgba(var(--primary),0.1)]
              data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground
              font-semibold text-sm group"
        >
          <span className="relative z-10">Most Sold</span>
          <div className="absolute inset-0 rounded-xl border border-transparent group-data-[state=active]:border-primary/20 transition-colors" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
