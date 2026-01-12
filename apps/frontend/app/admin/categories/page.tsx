import { apiClient } from "@/lib/api"
import { CategoryManager } from "@/components/admin/category-manager"
import { Badge } from "@/components/ui/badge"

export default async function AdminCategoriesPage() {
  const { data, error } = await apiClient.GET("/api/v1/admin/categories", {
    cache: "no-store",
  })

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Inventory</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Category management
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Organize the marketplace by creating and managing block categories.
        </p>
      </div>

      <CategoryManager initialCategories={error ? [] : data || []} />
    </div>
  )
}
