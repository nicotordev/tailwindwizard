import { Metadata } from "next"
import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api"
import { ProductView } from "@/components/marketplace/product-view"

export const metadata: Metadata = {
  title: "Block | TailwindWizard",
  description: "Preview a Tailwind block and purchase access.",
}

export default async function BlockProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: blocks, error } = await apiClient.GET("/api/v1/blocks", {
    params: {
      query: {
        search: params.slug,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        limit: "50",
      },
    },
    cache: "no-store",
  })

  if (error || !blocks) {
    notFound()
  }

  const block = blocks.find((item) => item.slug === params.slug)
  if (!block) {
    notFound()
  }

  const { data: reviews } = await apiClient.GET("/api/v1/blocks/{id}/reviews", {
    params: { path: { id: block.id } },
    cache: "no-store",
  })

  return <ProductView block={block} reviews={reviews || []} />
}
