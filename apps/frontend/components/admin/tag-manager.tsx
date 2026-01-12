"use client"

import * as React from "react"
import { frontendApi } from "@/lib/frontend-api"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { components } from "@/types/api"

type Tag = components["schemas"]["Tag"]

interface TagManagerProps {
  initialTags: Tag[]
}

export function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = React.useState(initialTags)
  const [filter, setFilter] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [currentTag, setCurrentTag] = React.useState<Partial<Tag> | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.slug.toLowerCase().includes(filter.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTag?.name || !currentTag?.slug) return

    setIsLoading(true)
    try {
      if (currentTag.id) {
        const { data } = await frontendApi.admin.tags.update(currentTag.id, currentTag)
        setTags((prev) => prev.map((t) => (t.id === data.id ? data : t)))
        toast.success("Tag updated")
      } else {
        const { data } = await frontendApi.admin.tags.create(currentTag)
        setTags((prev) => [...prev, data])
        toast.success("Tag created")
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast.error("Failed to save tag")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return

    setIsDeleting(true)
    try {
      await frontendApi.admin.tags.delete(id)
      setTags((prev) => prev.filter((t) => t.id !== id))
      toast.success("Tag deleted")
    } catch (error) {
      toast.error("Failed to delete tag")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 rounded-xl bg-background/60"
          />
        </div>
        <Button
          onClick={() => {
            setCurrentTag({ name: "", slug: "", description: "" })
            setIsDialogOpen(true)
          }}
          className="rounded-xl"
        >
          <Plus className="mr-2 size-4" />
          Add Tag
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          {filteredTags.length === 0 ? (
            <div className="py-20 text-center">
              <Tags className="mx-auto size-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-heading font-semibold">No tags found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or add a new tag.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead>Tag</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id} className="hover:bg-muted/20 border-border/40">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{tag.name}</span>
                        {tag.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {tag.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{tag.slug}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg">
                        {tag._count?.blocks || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                          onClick={() => {
                            setCurrentTag(tag)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg text-destructive hover:text-destructive"
                          onClick={() => handleDelete(tag.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{currentTag?.id ? "Edit Tag" : "Add Tag"}</DialogTitle>
            <DialogDescription>
              Tags help in organizing and searching for specific block types.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={currentTag?.name || ""}
                onChange={(e) => {
                  const name = e.target.value
                  const slug = currentTag?.slug || name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "")
                  setCurrentTag((prev) => ({ ...prev, name, slug }))
                }}
                placeholder="e.g. Responsive"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                value={currentTag?.slug || ""}
                onChange={(e) => setCurrentTag((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g. responsive"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                value={currentTag?.description || ""}
                onChange={(e) => setCurrentTag((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short description of this tag..."
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-xl">
                {isLoading ? "Saving..." : "Save Tag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
