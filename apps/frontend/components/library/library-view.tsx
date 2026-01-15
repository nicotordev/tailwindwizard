"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search, LayoutGrid, List, SlidersHorizontal, Package, Download, Terminal, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeliveryStatusBadge } from "@/components/primitives/status-badges"
import { DateDisplay } from "@/components/primitives/formatters"
import { EmptyState } from "@/components/primitives/empty-state"
import type { License } from "@/types/extended"
import { AddToCollectionDialog } from "@/components/dashboard/collections/add-to-collection-dialog"

interface LibraryViewProps {
  initialLicenses: License[]
}

export function LibraryView({ initialLicenses }: LibraryViewProps) {
  const [search, setSearch] = React.useState("")
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [filter, setFilter] = React.useState("all")
  const [collectionBlockId, setCollectionBlockId] = React.useState<string | null>(null)

  const filteredLicenses = initialLicenses.filter(license => {
    const matchesSearch = license.block?.title.toLowerCase().includes(search.toLowerCase()) || 
                         license.block?.description?.toLowerCase().includes(search.toLowerCase())
    
    if (filter === "all") return matchesSearch
    return matchesSearch && license.type === filter.toUpperCase()
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your library..." 
            className="pl-10 h-11 bg-card/50 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-11 w-[160px] bg-card/50 rounded-xl">
              <SlidersHorizontal className="size-4 mr-2" />
              <SelectValue placeholder="License Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Licenses</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
            <Button 
              variant={view === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-lg"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button 
              variant={view === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-lg"
              onClick={() => setView("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {!filteredLicenses.length ? (
        <EmptyState 
          title={search ? "No matches found" : "Your library is empty"}
          description={search ? "Try adjusting your search or filters." : "Explore the marketplace to acquire your first Tailwind magic."}
          icon={Package}
          action={!search ? {
            label: "Browse Marketplace",
            href: "/market"
          } : undefined}
          variant="hero"
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLicenses.map((license) => (
            <Card key={license.id} className="group overflow-hidden bg-card/40 backdrop-blur-xl border-border/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 rounded-3xl relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold font-heading">
                      {license.block?.title || "Enchanted Block"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{license.type} LICENSE</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <DeliveryStatusBadge status={license.deliveryStatus} />
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setCollectionBlockId(license.blockId)}
                        title="Add to Collection"
                    >
                        <Bookmark className="size-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
                  {license.block?.description || "No description provided for this component."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-40 w-full rounded-2xl bg-muted/30 border border-dashed border-border/60 flex items-center justify-center group-hover:bg-muted/20 transition-colors">
                   {/* Thumbnail placeholder */}
                   <Package className="size-10 text-muted-foreground/20" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-4">
                   <span>Acquired <DateDisplay date={license.createdAt} /></span>
                   <span className="font-mono">v{license.block?.version || "1.0.0"}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="gap-2 rounded-xl h-10" size="sm">
                    <Download className="size-4" />
                    Download
                  </Button>
                  <Button variant="secondary" className="gap-2 rounded-xl h-10 border-border/60" size="sm">
                    <Terminal className="size-4" />
                    CLI Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card/30 backdrop-blur-md rounded-[2rem] border border-border/40 overflow-hidden">
          <div className="divide-y divide-border/40">
            {filteredLicenses.map((license) => (
              <div key={license.id} className="flex items-center justify-between p-6 group hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="size-6 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h4 className="font-bold tracking-tight">{license.block?.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {license.type} License • Acquired <DateDisplay date={license.createdAt} />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DeliveryStatusBadge status={license.deliveryStatus} />
                  <div className="h-8 w-px bg-border/60 mx-2" />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-lg h-9 w-9 text-muted-foreground hover:text-primary"
                    onClick={() => setCollectionBlockId(license.blockId)}
                    title="Add to Collection"
                  >
                    <Bookmark className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="rounded-lg h-9 w-9">
                    <Download className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="rounded-lg h-9 w-9">
                    <Terminal className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddToCollectionDialog 
        blockId={collectionBlockId} 
        open={!!collectionBlockId} 
        onOpenChange={(open) => !open && setCollectionBlockId(null)} 
      />
    </div>
  )
}
