import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
type MarketTab = { value: string; label: string };

type MarketTabsProps = {
  value: string;
  onChange: (value: string) => void;
  tabs: MarketTab[];
};

export function MarketTabs({ value, onChange, tabs }: MarketTabsProps) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <TabsList
        className="w-full justify-start gap-2 overflow-x-auto bg-transparent h-auto p-0"
        aria-label="Market sections"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="whitespace-nowrap px-6 py-2.5 rounded-xl border border-transparent transition-all
              data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 data-[state=active]:shadow-sm
              data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/50 data-[state=inactive]:hover:text-foreground
              font-medium text-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
