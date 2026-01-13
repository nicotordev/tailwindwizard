"use client";

import { EmptyState } from "@/components/primitives/empty-state";
import { Money } from "@/components/primitives/formatters";
import {
  BlockStatusBadge,
  type BlockStatus,
} from "@/components/primitives/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/extended";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Box,
  ExternalLink,
  Eye,
  Globe,
  LayoutGrid,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash,
  TrendingUp,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreatorBlocksViewProps {
  blocks: Block[];
  meta?: PaginationMeta;
  searchParams: Record<string, string | string[] | undefined>;
}

function normalizeQueryParam(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function buildUrl(pathname: string, params: URLSearchParams): string {
  const qs = params.toString();
  return qs.length > 0 ? `${pathname}?${qs}` : pathname;
}

export function CreatorBlocksView({
  blocks,
  meta,
  searchParams,
}: CreatorBlocksViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  const initialQ = normalizeQueryParam(searchParams.q) ?? "";
  const [search, setSearch] = React.useState<string>(initialQ);
  const lastSyncQ = React.useRef<string>(initialQ);

  // Sync state from URL (important for back/forward navigation)
  React.useEffect(() => {
    const qInUrl = urlSearchParams.get("q") ?? "";
    if (qInUrl !== lastSyncQ.current) {
      setSearch(qInUrl);
      lastSyncQ.current = qInUrl;
    }
  }, [urlSearchParams]);

  // Debounced search: update URL when search text changes
  React.useEffect(() => {
    const qInUrl = urlSearchParams.get("q") || "";
    const trimmedSearch = search.trim();

    // Skip if state already matches the URL to prevent loops and unnecessary resets
    if (trimmedSearch === qInUrl) return;

    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(urlSearchParams.toString());

      if (trimmedSearch.length > 0) {
        next.set("q", trimmedSearch);
      } else {
        next.delete("q");
      }

      // Reset to page 1 whenever the search query changes
      next.set("page", "1");

      const nextUrl = buildUrl(pathname, next);
      lastSyncQ.current = trimmedSearch;
      router.replace(nextUrl, { scroll: false });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [search, pathname, router, urlSearchParams]);

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      const next = new URLSearchParams(urlSearchParams.toString());
      next.set("page", String(newPage));
      router.push(buildUrl(pathname, next));
    },
    [pathname, router, urlSearchParams]
  );

  const hasSearch = search.trim().length > 0;

  if (!blocks.length && !hasSearch) {
    return (
      <EmptyState
        title="Forge your first component"
        description="Share your craft with the world and start earning. Your library is currently empty."
        icon={Plus}
        action={{
          label: "Create Block",
          href: "/dashboard/blocks/new",
          icon: Plus,
        }}
        variant="hero"
      />
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Enhanced Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full bg-primary/5 border-primary/20 text-primary px-3 py-1 text-[10px] uppercase tracking-wider font-bold"
            >
              Component Library
            </Badge>
            <span className="text-muted-foreground/30">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {meta?.total || 0} Blocks Created
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-heading">
            My{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent italic">
              Wizardry
            </span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Manage your high-performance components, track their status, and
            keep your marketplace presence sharp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-2xl h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          >
            <Link href="/dashboard/blocks/new">
              <Plus className="mr-2 size-5" />
              Create Block
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-card/30 backdrop-blur-md rounded-[2rem] border-border/40 overflow-hidden shadow-2xl shadow-primary/5 transition-all duration-500">
        <div className="p-8 border-b border-border/40 bg-muted/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search blocks by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-muted/40 border-border/40 focus-visible:ring-primary/20 focus-visible:bg-muted/60 transition-all border-none shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium px-4 py-2 bg-muted/20 rounded-xl border border-border/30">
              <LayoutGrid className="size-4" />
              Table View
            </div>
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/30 h-14">
                <TableHead className="pl-8 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                  Block Identity
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                  Pricing
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                  Performance
                </TableHead>
                <TableHead className="text-right pr-8 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                  Sales
                </TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {blocks.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center bg-muted/5"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Package className="size-12 opacity-10" />
                        <p className="text-sm font-medium">
                          No components found matching your search.
                        </p>
                      </div>
                    </TableCell>
                  </motion.tr>
                ) : (
                  blocks.map((block, index) => (
                    <motion.tr
                      key={block.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/30 last:border-0"
                    >
                      <TableCell className="pl-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 ring-1 ring-border/50 shadow-sm relative overflow-hidden">
                            {block.iconURL ? (
                              <img
                                src={block.iconURL}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <Box className="size-6 transition-transform group-hover:scale-110" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {block.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 font-mono tracking-tight flex items-center gap-1 uppercase">
                              /{block.slug}
                              {block.status === "PUBLISHED" && (
                                <ExternalLink className="size-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <BlockStatusBadge
                          status={block.status as BlockStatus}
                          className="rounded-full px-2.5 py-0.5 text-[10px]"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <Money
                            amount={block.price}
                            className="font-bold text-sm"
                          />
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            One-time
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10">
                            <Star className="size-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-foreground">
                              {Number(block.ratingAvg || 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            ({block.ratingCount || 0} reviews)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-foreground">
                            {block.soldCount}
                          </span>
                          {block.soldCount > 0 && (
                            <div className="flex items-center gap-1 text-[9px] text-green-500 font-bold bg-green-500/10 px-1.5 rounded-full">
                              <TrendingUp className="size-2.5" />
                              Active
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-8">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
                          <BlockActions block={block} />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
        {meta && meta.totalPages > 1 && (
          <CardFooter className="py-6 border-t border-border/40 bg-muted/5">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(Math.max(1, meta.page - 1));
                    }}
                    className={cn(
                      "rounded-xl border-border/40 bg-background/50 backdrop-blur-sm",
                      meta.page === 1 &&
                        "pointer-events-none opacity-40 grayscale"
                    )}
                  />
                </PaginationItem>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(p);
                        }}
                        isActive={p === meta.page}
                        className={cn(
                          "rounded-xl border-border/40 transition-all duration-300",
                          p === meta.page
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                            : "bg-background/50 hover:bg-muted"
                        )}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(
                        Math.min(meta.totalPages, meta.page + 1)
                      );
                    }}
                    className={cn(
                      "rounded-xl border-border/40 bg-background/50 backdrop-blur-sm",
                      meta.page === meta.totalPages &&
                        "pointer-events-none opacity-40 grayscale"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function BlockActions({ block }: { block: Block }) {
  const status = block.status as BlockStatus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all"
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] rounded-2xl p-2 border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl"
      >
        {/* DRAFT: Edit */}
        {status === "DRAFT" && (
          <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10">
            <Link href={`/dashboard/blocks/${block.id}`}>
              <Pencil className="mr-2 size-4 text-primary" />
              Edit Block
            </Link>
          </DropdownMenuItem>
        )}

        {/* SUBMITTED: Cancel */}
        {status === "SUBMITTED" && (
          <DropdownMenuItem
            className="rounded-xl focus:bg-amber-100/50"
            onSelect={() => {
              toast.message("Submission cancellation is queued for support.");
            }}
          >
            <Ban className="mr-2 size-4 text-amber-500" />
            Cancel Review
          </DropdownMenuItem>
        )}

        {/* APPROVED: Publish */}
        {status === "APPROVED" && (
          <DropdownMenuItem
            className="rounded-xl text-green-600 focus:text-green-600 focus:bg-green-50"
            onSelect={() => {
              toast.message("Publish flow is coming online shortly.");
            }}
          >
            <Globe className="mr-2 size-4" />
            Publish
          </DropdownMenuItem>
        )}

        {/* REJECTED: Edit */}
        {status === "REJECTED" && (
          <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/10">
            <Link href={`/dashboard/blocks/${block.id}`}>
              <Pencil className="mr-2 size-4 text-primary" />
              Fix & Resubmit
            </Link>
          </DropdownMenuItem>
        )}

        {/* PUBLISHED: View */}
        {status === "PUBLISHED" && (
          <>
            <DropdownMenuItem
              asChild
              className="rounded-xl focus:bg-primary/10"
            >
              <Link href={`/block/${block.slug}`} target="_blank">
                <Eye className="mr-2 size-4 text-primary" />
                View Page
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl focus:bg-primary/10"
              onSelect={() => {
                toast.message("Version updates will be available soon.");
              }}
            >
              <Upload className="mr-2 size-4 text-primary" />
              Update Version
            </DropdownMenuItem>
          </>
        )}

        <div className="my-1 h-px bg-border/40" />

        <DropdownMenuItem
          className="rounded-xl text-destructive focus:text-destructive focus:bg-destructive/10"
          onSelect={() => {
            toast.message("Deletion requests are handled by support.");
          }}
        >
          <Trash className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
