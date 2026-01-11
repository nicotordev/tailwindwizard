import { Metadata } from "next"
import { apiClient } from "@/lib/api"
import { ExploreView } from "@/components/marketplace/explore-view"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Explore | TailwindWizard",
  description: "Browse curated Tailwind blocks from the marketplace.",
}

export default async function ExplorePage() {
  const { data: blocks, error: blocksError } = await apiClient.GET("/api/v1/blocks", {
    params: {
      query: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        limit: "60",
      },
    },
    cache: "no-store",
  })

  const { data: categories } = await apiClient.GET("/api/v1/categories", {
    cache: "no-store",
  })

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Marketplace</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Explore the spellbook
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Discover production-ready Tailwind blocks curated by top creators.
        </p>
      </div>

      <ExploreView
        initialBlocks={blocksError ? [] : blocks || []}
        categories={categories || []}
      />
    </div>
  )
}
