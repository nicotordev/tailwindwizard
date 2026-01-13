import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Money } from "@/components/primitives/formatters"
import type { Block } from "@/types/extended"
import { Star, Box, ArrowRight } from "lucide-react"

export function BlockRow({ block }: { block: Block }) {
  const preview = block.previews?.[0]

  return (
    <Link
      href={`/market/blocks/${block.slug}`}
      className="group flex items-center gap-4 p-4 bg-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/50 hover:bg-card/60 transition-all duration-300 rounded-3xl mb-3 shadow-sm hover:shadow-xl hover:shadow-primary/50"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-muted/30 transition-transform duration-500 group-hover:scale-105">
        {preview?.url ? (
          <Image
            src={preview.url}
            alt={`${block.title} preview`}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Box className="size-8" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-foreground font-heading font-semibold text-lg truncate group-hover:text-primary transition-colors">
          {block.title}
        </h4>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-2 py-0 text-[10px] font-medium uppercase tracking-wider">
            {block.framework}
          </Badge>
          <Badge variant="outline" className="px-2 py-0 text-[10px] uppercase tracking-wider border-border/50">
            {block.stylingEngine}
          </Badge>
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center gap-1.5 px-6 border-x border-border/30">
        <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
          <Star className="size-3 text-amber-500 fill-amber-500" />
          <span>{Number(block.ratingAvg || 0).toFixed(1)}</span>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          {block.ratingCount || 0} reviews
        </span>
      </div>

      <div className="text-right min-w-30 pr-2 space-y-1">
        <div className="text-2xl font-heading font-bold tracking-tight">
          <Money amount={block.price} />
        </div>
        <div className="flex items-center justify-end text-[10px] text-muted-foreground font-medium uppercase tracking-widest gap-1">
          <span>{Number(block.price) === 0 ? "Free" : "Unlock Now"}</span>
          <ArrowRight className="size-2.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
