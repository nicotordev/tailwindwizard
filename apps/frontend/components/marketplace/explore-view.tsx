"use client"

import * as React from "react"
import type { Block } from "@/types/extended"
import type { components } from "@/types/api"
import { BlockCard } from "@/components/marketplace/block-card"
import { EmptyState } from "@/components/primitives/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"

type Category = components["schemas"]["Category"]

interface ExploreViewProps {
  initialBlocks: Block[]
  categories?: Category[]
}

export function ExploreView({ initialBlocks, categories }: ExploreViewProps) {
  const [search, setSearch] = React.useState("")
  const [framework, setFramework] = React.useState("all")
  const [styling, setStyling] = React.useState("all")
  const [pricing, setPricing] = React.useState("all")
  const [category, setCategory] = React.useState("all")

  const filteredBlocks = React.useMemo(() => {
    return initialBlocks.filter((block) => {
      const matchesSearch =
        block.title.toLowerCase().includes(search.toLowerCase()) ||
        (block.description || "").toLowerCase().includes(search.toLowerCase())

      const matchesFramework =
        framework === "all" || block.framework === framework
      const matchesStyling =
        styling === "all" || block.stylingEngine === styling
      const matchesPricing =
        pricing === "all" ||
        (pricing === "free" ? Number(block.price) === 0 : Number(block.price) > 0)
      const matchesCategory =
        category === "all" ||
        block.categories?.some((entry) => entry.category.slug === category)

      return (
        matchesSearch &&
        matchesFramework &&
        matchesStyling &&
        matchesPricing &&
        matchesCategory
      )
    })
  }, [category, framework, initialBlocks, pricing, search, styling])

  const resetFilters = () => {
    setSearch("")
    setFramework("all")
    setStyling("all")
    setPricing("all")
    setCategory("all")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks, keywords, or styles..."
            className="pl-10 h-11 bg-card/50 rounded-xl"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger className="h-11 w-[150px] bg-card/50 rounded-xl">
              <SlidersHorizontal className="size-4 mr-2" />
              <SelectValue placeholder="Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frameworks</SelectItem>
              <SelectItem value="REACT">React</SelectItem>
              <SelectItem value="VUE">Vue</SelectItem>
              <SelectItem value="SVELTE">Svelte</SelectItem>
            </SelectContent>
          </Select>

          <Select value={styling} onValueChange={setStyling}>
            <SelectTrigger className="h-11 w-[150px] bg-card/50 rounded-xl">
              <SelectValue placeholder="Styling" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styling</SelectItem>
              <SelectItem value="TAILWIND">Tailwind</SelectItem>
              <SelectItem value="CSS">CSS</SelectItem>
            </SelectContent>
          </Select>

          <Select value={pricing} onValueChange={setPricing}>
            <SelectTrigger className="h-11 w-[140px] bg-card/50 rounded-xl">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          {categories?.length ? (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 w-[160px] bg-card/50 rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredBlocks.length} blocks</span>
        <Button variant="ghost" size="sm" className="rounded-xl" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>

      {!filteredBlocks.length ? (
        <EmptyState
          title="No blocks match your filters"
          description="Try a different search term or clear filters."
          icon={SlidersHorizontal}
          action={{
            label: "Clear filters",
            onClick: resetFilters,
          }}
          variant="hero"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBlocks.map((block) => (
            <BlockCard key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  )
}
