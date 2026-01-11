import { Metadata } from "next"
import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api"
import { BlockDetailView } from "@/components/creator/block-detail-view"

export const metadata: Metadata = {
  title: "Block Detail | TailwindWizard",
  description: "Manage your Tailwind block details and status.",
}

export default async function BlockDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data, error } = await apiClient.GET("/api/v1/blocks/{id}", {
    params: {
      path: { id: params.id },
    },
    cache: "no-store",
  })

  if (error || !data) {
    notFound()
  }

  return <BlockDetailView block={data} />
}
