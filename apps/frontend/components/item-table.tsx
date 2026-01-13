import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MarketItem } from "@/lib/data";
import { cn, formatPriceUSD } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, Boxes } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type SortKey = "name" | "quantity" | "price";
export type SortState = { key: SortKey; direction: "asc" | "desc" };

type ItemTableProps = {
  items: MarketItem[];
  isLoading: boolean;
  isMobile: boolean;
  sort: SortState;
  onSort: (key: SortKey) => void;
  showActions?: boolean;
};

const columns = [
  { key: "name" as const, label: "NAME", aria: "Sort by name" },
  { key: "price" as const, label: "PRICE", aria: "Sort by price" },
  { key: "action" as const, label: "ACTION", aria: "Action" },
];

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) {
  if (!active) return <ArrowUpDown className="size-3.5 opacity-50" />;
  return direction === "asc" ? (
    <ArrowUp className="size-3.5 text-primary" />
  ) : (
    <ArrowDown className="size-3.5 text-primary" />
  );
}

export function ItemTable({
  items,
  isLoading,
  isMobile,
  sort,
  onSort,
  showActions = true,
}: ItemTableProps) {
  const router = useRouter();
  const tableColumns = showActions
    ? columns
    : columns.filter(col => col.key !== "action");

  const handleRowClick = (item: MarketItem) => {
    if (item.blockId) {
      router.push(`/market/blocks/${item.blockId}`);
    }
  };

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
          <div className="text-lg font-heading font-semibold">
            No blocks found
          </div>
          <p className="text-sm text-muted-foreground max-w-62.5">
            Try adjusting your search or changing the category to find what you
            need.
          </p>
        </CardContent>
      </Card>
    );

  if (isMobile)
    return (
      <div className="grid gap-4" data-testid="card-view">
        {items.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "rounded-2xl border-border/50 bg-card/40 backdrop-blur-sm transition-all hover:bg-muted/30",
              item.blockId && "cursor-pointer"
            )}
            onClick={() => handleRowClick(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex size-16 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background/50 p-1">
                  {item.screenshot ? (
                    <Image
                      src={item.screenshot}
                      alt={item.name}
                      className="size-full object-contain rounded-lg"
                      width={50}
                      height={50}
                    />
                  ) : (
                    <Boxes className="size-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold font-heading truncate leading-snug">
                    {item.name}
                  </div>
                  <div className="text-[12px] font-medium text-muted-foreground/70 mt-0.5">
                    {item.details || `${item.game} | ${item.quantity} units`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-2">
                  <div className="text-[15px] font-bold text-foreground">
                    {formatPriceUSD(item.priceUSD)}
                  </div>
                  {showActions && (
                    <div
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border",
                        item.actionType === "sold"
                          ? "bg-creator/10 text-creator border-creator/20"
                          : "bg-builder/10 text-builder border-builder/20"
                      )}
                    >
                      {item.actionType === "sold" ? "Sold" : "Bought"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <div
      className="rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden"
      data-testid="table-view"
    >
      <Table>
        <TableHeader className="border-b border-border/40">
          <TableRow className="hover:bg-transparent border-none">
            {tableColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-12 py-0",
                  column.key === "name"
                    ? "w-[50%] md:w-[60%]"
                    : "w-[25%] md:w-[20%] text-center"
                )}
              >
                {column.key !== "action" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-full w-full justify-start gap-2 px-4 text-[11px] font-bold tracking-widest text-muted-foreground/60 hover:bg-transparent hover:text-primary transition-colors"
                    onClick={() => onSort(column.key as SortKey)}
                    aria-label={column.aria}
                  >
                    {column.label}
                    <SortIcon
                      active={sort.key === column.key}
                      direction={sort.direction}
                    />
                  </Button>
                ) : (
                  <div className="flex items-center justify-center h-full text-[11px] font-bold tracking-widest text-muted-foreground/60">
                    {column.label}
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                "group border-none hover:bg-muted/30 transition-all duration-300",
                item.blockId && "cursor-pointer"
              )}
              onClick={() => handleRowClick(item)}
            >
              <TableCell className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex size-14 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background/50 p-1 transition-transform group-hover:scale-105">
                    {item.screenshot ? (
                      <Image
                        src={item.screenshot}
                        alt={item.name}
                        className="size-full object-contain rounded-lg"
                        width={50}
                        height={50}
                      />
                    ) : (
                      <Boxes className="size-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="truncate font-bold text-[15px] text-foreground transition-colors group-hover:text-primary">
                      {item.name}
                    </div>
                    <div className="text-[12px] font-medium text-muted-foreground/70">
                      {item.details || `${item.game} | ${item.quantity} units`}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-4 text-center">
                <div className="font-bold text-[16px] text-foreground">
                  {formatPriceUSD(item.priceUSD)}
                </div>
              </TableCell>

              {showActions && (
                <TableCell className="px-4">
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "inline-flex flex-col items-center justify-center min-w-22.5 px-3 py-1.5 rounded-lg font-bold transition-all duration-300 border",
                        item.actionType === "sold"
                          ? "bg-creator/10 text-creator border-creator/20 group-hover:bg-creator/20"
                          : "bg-builder/10 text-builder border-builder/20 group-hover:bg-builder/20"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-[0.15em] opacity-80 leading-none">
                        {item.actionType === "sold" ? "Sold" : "Bought"}
                      </span>
                      <span className="text-[13px] mt-1 font-heading">
                        {formatPriceUSD(item.priceUSD)}
                      </span>
                    </div>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
