import { Metadata } from "next"
import { apiClient } from "@/lib/api"
import { CreatorBlocksView } from "@/components/creator/blocks-view"

export const metadata: Metadata = {
  title: "My Blocks | TailwindWizard",
  description: "Manage your component library.",
}

export default async function CreatorBlocksPage() {
  const { data, error } = await apiClient.GET("/api/v1/creators/me/blocks", {
    cache: "no-store"
  })

  if (error) {
    throw new Error("Failed to fetch blocks")
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <CreatorBlocksView blocks={data || []} />
    </div>
  )
}
