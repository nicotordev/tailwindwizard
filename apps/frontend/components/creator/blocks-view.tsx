"use client"

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Eye, Trash, Ban, Globe, Upload, Star, Search } from "lucide-react"
import { BlockStatusBadge, type BlockStatus } from "@/components/primitives/status-badges"
import { Money } from "@/components/primitives/formatters"
import { EmptyState } from "@/components/primitives/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Block } from "@/types/extended"
import { toast } from "sonner"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface CreatorBlocksViewProps {
  blocks: Block[]
  meta?: PaginationMeta
}

export function CreatorBlocksView({ blocks, meta }: CreatorBlocksViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get("q") || "")

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (search) {
        params.set("q", search)
      } else {
        params.delete("q")
      }
      params.set("page", "1") // Reset to page 1 on search
      router.replace(`${pathname}?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, pathname, router, searchParams]) // Caution with deps, strict mode might double trigger

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!blocks.length && !search) {
    return (
      <EmptyState
        title="No blocks yet"
        description="Create your first block to start selling."
        icon={Plus}
        action={{
          label: "Create Block",
          href: "/dashboard/blocks/new",
          icon: Plus
        }}
        variant="hero"
      />
    )
  }

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle>My Blocks</CardTitle>
            <CardDescription>Manage your component library.</CardDescription>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/blocks/new">
              <Plus className="mr-2 size-4" />
              Create New
            </Link>
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search blocks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-muted/20 border-border/40 focus-visible:ring-primary/20"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.length === 0 ? (
              <TableRow>
                 <TableCell colSpan={6} className="h-24 text-center">
                    No results found.
                 </TableCell>
              </TableRow>
            ) : (
              blocks.map((block) => (
                <TableRow key={block.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{block.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">{block.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <BlockStatusBadge status={block.status as BlockStatus} />
                  </TableCell>
                  <TableCell>
                    <Money amount={block.price} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-foreground">
                        {Number(block.ratingAvg || 0).toFixed(1)}
                      </span>
                      <span>({block.ratingCount || 0})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {block.soldCount}
                  </TableCell>
                  <TableCell>
                    <BlockActions block={block} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      {meta && meta.totalPages > 1 && (
        <CardFooter className="py-4 border-t border-border/40">
           <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(Math.max(1, meta.page - 1)); }} 
                  className={meta.page === 1 ? "pointer-events-none opacity-50" : undefined} 
                />
              </PaginationItem>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                 <PaginationItem key={p}>
                   <PaginationLink 
                     href="#" 
                     onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
                     isActive={p === meta.page}
                   >
                     {p}
                   </PaginationLink>
                 </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); handlePageChange(Math.min(meta.totalPages, meta.page + 1)); }}
                  className={meta.page === meta.totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  )
}

function BlockActions({ block }: { block: Block }) {
  const status = block.status as BlockStatus

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
        {/* DRAFT: Edit */}
        {status === "DRAFT" && (
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/blocks/${block.id}`}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}

        {/* SUBMITTED: Cancel */}
        {status === "SUBMITTED" && (
          <DropdownMenuItem
            onSelect={() => {
              toast.message("Submission cancellation is queued for support.")
            }}
          >
            <Ban className="mr-2 size-4" />
            Cancel Review
          </DropdownMenuItem>
        )}

        {/* APPROVED: Publish */}
        {status === "APPROVED" && (
          <DropdownMenuItem
            className="text-green-600 focus:text-green-600"
            onSelect={() => {
              toast.message("Publish flow is coming online shortly.")
            }}
          >
            <Globe className="mr-2 size-4" />
            Publish
          </DropdownMenuItem>
        )}

        {/* REJECTED: Edit */}
        {status === "REJECTED" && (
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/blocks/${block.id}`}>
              <Pencil className="mr-2 size-4" />
              Fix & Resubmit
            </Link>
          </DropdownMenuItem>
        )}

        {/* PUBLISHED: View */}
        {status === "PUBLISHED" && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/block/${block.slug}`} target="_blank">
                <Eye className="mr-2 size-4" />
                View Page
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                toast.message("Version updates will be available soon.")
              }}
            >
              <Upload className="mr-2 size-4" />
              Update Version
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => {
            toast.message("Deletion requests are handled by support.")
          }}
        >
          <Trash className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
