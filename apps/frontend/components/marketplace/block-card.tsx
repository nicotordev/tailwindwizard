import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Money } from "@/components/primitives/formatters"
import type { Block } from "@/types/extended"
import { Star, Box } from "lucide-react"

export function BlockCard({ block }: { block: Block }) {
  const preview = block.previews?.[0]

  return (
    <Card className="group overflow-hidden bg-card/40 backdrop-blur-xl border-border/50 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      <Link href={`/market/blocks/${block.slug}`} className="block">
        <CardHeader className="space-y-4">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-border/40 bg-muted/30">
            {preview?.url ? (
              <Image
                src={preview.url}
                alt={`${block.title} preview`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                <Box className="size-10" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-heading">
              {block.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {block.description || "A crafted UI block ready to deploy."}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{block.framework}</Badge>
            <Badge variant="secondary">{block.stylingEngine}</Badge>
            <Badge variant="outline">{block.type}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <Money amount={(block.price as number)} />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-foreground">
                {Number(block.ratingAvg || 0).toFixed(1)}
              </span>
              <span>({block.ratingCount || 0})</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
