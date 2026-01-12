"use client"
import type { Block } from "@/types/extended"
import type { components } from "@/types/api"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Money } from "@/components/primitives/formatters"
import { Star, Monitor, Tablet, Smartphone, Package, ShoppingCart } from "lucide-react"

type Review = components["schemas"]["Review"]
type PreviewAsset = components["schemas"]["PreviewAsset"]

interface ProductViewProps {
  block: Block
  reviews: Review[]
}

const viewports = [
  { key: "DESKTOP", label: "Desktop", icon: Monitor },
  { key: "TABLET", label: "Tablet", icon: Tablet },
  { key: "MOBILE", label: "Mobile", icon: Smartphone },
] as const

export function ProductView({ block, reviews }: ProductViewProps) {
  const previewMap = viewports.reduce<Record<string, PreviewAsset | null>>(
    (acc, viewport) => {
      acc[viewport.key] = block.previews?.find((item) => item.viewport === viewport.key) ?? null
      return acc
    },
    {}
  )

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-heading font-bold tracking-tight">{block.title}</h1>
            <p className="text-muted-foreground max-w-2xl">
              {block.description || "A production-ready block crafted for your next build."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {viewports.map((viewport) => {
              const Icon = viewport.icon
              const preview = previewMap[viewport.key]
              return (
                <div
                  key={viewport.key}
                  className="rounded-2xl border border-border/40 bg-muted/20 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 border-b border-border/40 text-xs uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" /> {viewport.label}
                    </span>
                  </div>
                  <div className="relative h-44 w-full bg-muted/30">
                    {preview?.url ? (
                      <Image
                        src={preview.url}
                        alt={`${block.title} ${viewport.label} preview`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                        <Package className="size-10" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-heading">Instant access</CardTitle>
              <CardDescription>
                Secure download and CLI install tokens after purchase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-lg">
                <Money amount={block.price} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-foreground">
                    {Number(block.ratingAvg || 0).toFixed(1)}
                  </span>
                  <span>({block.ratingCount || 0})</span>
                </div>
              </div>
              <Button className="w-full rounded-xl gap-2" disabled>
                <ShoppingCart className="size-4" /> Checkout (Stripe soon)
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{block.framework}</Badge>
                <Badge variant="secondary">{block.stylingEngine}</Badge>
                <Badge variant="outline">{block.type}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Tech stack</CardTitle>
              <CardDescription>Built for modern UI workflows.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">{block.framework}</Badge>
              <Badge variant="secondary">{block.stylingEngine}</Badge>
              <Badge variant="secondary">{block.type}</Badge>
              <Badge variant="outline">{block.visibility}</Badge>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Dependencies</CardTitle>
              <CardDescription>Registry and package requirements.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>No registry entries yet.</p>
              <p>No NPM dependencies declared.</p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Description</CardTitle>
              <CardDescription>From the creator.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {block.description || "No description has been published yet."}
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Changelog</CardTitle>
              <CardDescription>Release notes and updates.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No changelog entries have been posted yet.
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Reviews</CardTitle>
            <CardDescription>Verified customer feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length ? (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                No reviews yet. Be the first to share feedback.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/60 p-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Star className="size-3 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-foreground">{review.rating.toFixed(1)}</span>
        </div>
        <span>{review.buyer?.name || "Verified buyer"}</span>
      </div>
      {review.title && <p className="font-semibold">{review.title}</p>}
      {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
    </div>
  )
}
