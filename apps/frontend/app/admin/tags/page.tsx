import { apiClient } from "@/lib/api"
import { TagManager } from "@/components/admin/tag-manager"
import { Badge } from "@/components/ui/badge"

export default async function AdminTagsPage() {
  const { data, error } = await apiClient.GET("/api/v1/admin/tags", {
    cache: "no-store",
  })

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Inventory</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Tag management
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Create and manage tags for better block searchability and organization.
        </p>
      </div>

      <TagManager initialTags={error ? [] : data || []} />
    </div>
  )
}
