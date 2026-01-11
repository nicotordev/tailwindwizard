import { ArrowDown, ArrowUp, ArrowUpDown, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPriceUSD } from "@/lib/format";
import type { MarketItem } from "@/lib/data";

export type SortKey = "name" | "quantity" | "price";
export type SortState = { key: SortKey; direction: "asc" | "desc" };

type ItemTableProps = { items: MarketItem[]; isLoading: boolean; isMobile: boolean; sort: SortState; onSort: (key: SortKey) => void };

const columns = [
  { key: "name" as const, label: "BLOCK", aria: "Sort by name" },
  { key: "quantity" as const, label: "QUANTITY", aria: "Sort by quantity" },
  { key: "price" as const, label: "PRICE (USD)", aria: "Sort by price" },
];

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="size-3.5 opacity-50" />;
  return direction === "asc" ? <ArrowUp className="size-3.5 text-primary" /> : <ArrowDown className="size-3.5 text-primary" />;
}

export function ItemTable({
  items,
  isLoading,
  isMobile,
  sort,
  onSort,
}: ItemTableProps) {
  if (isLoading)
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (items.length === 0)
    return (
      <Card className="rounded-[2rem] border-dashed border-border/60 bg-transparent">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <div className="rounded-full bg-muted/30 p-4">
            <Boxes className="size-8 text-muted-foreground/40" />
          </div>
          <div className="text-lg font-heading font-semibold">No blocks found</div>
          <p className="text-sm text-muted-foreground max-w-[250px]">Try adjusting your search or changing the category to find what you need.</p>
        </CardContent>
      </Card>
    );

  if (isMobile)
    return (
      <div className="grid gap-4" data-testid="card-view">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold font-heading truncate">{item.name}</div>
                  <Badge variant="outline" className="mt-1 text-[10px] font-semibold tracking-wider uppercase opacity-70">
                    {item.game}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Qty: <span className="text-foreground">{item.quantity}</span>
                </div>
                <div className="text-lg font-bold text-primary font-heading">
                  {formatPriceUSD(item.priceUSD)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <div className="rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden" data-testid="table-view">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-border/40">
            {columns.map((column) => (
              <TableHead key={column.key} className="h-12 py-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-full w-full justify-start gap-2 px-4 text-xs font-bold tracking-widest text-muted-foreground/70 hover:bg-transparent hover:text-primary transition-colors"
                  onClick={() => onSort(column.key)}
                  aria-label={column.aria}
                >
                  {column.label}
                  <SortIcon active={sort.key === column.key} direction={sort.direction} />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="group border-border/40 hover:bg-primary/[0.02] transition-colors">
              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Boxes className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold font-heading text-foreground" data-testid="row-name">
                      {item.name}
                    </div>
                    <div className="mt-0.5">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-border/60 font-semibold opacity-60">
                        {item.game}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 font-medium text-muted-foreground" data-testid="row-quantity">
                {item.quantity} units
              </TableCell>
              <TableCell className="px-4" data-testid="row-price">
                <span className="font-bold text-base text-foreground font-heading">
                  {formatPriceUSD(item.priceUSD)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
