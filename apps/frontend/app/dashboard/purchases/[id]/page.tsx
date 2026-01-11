import { Metadata } from "next"
import { apiClient } from "@/lib/api"
import { PurchaseDetailView } from "@/components/purchases/purchase-detail-view"
import { notFound } from "next/navigation"
import type { ExtendedPurchase } from "@/types/extended"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order #${id.slice(-8).toUpperCase()} | TailwindWizard`,
  }
}

export default async function PurchaseDetailPage({ params }: PageProps) {
  const { id } = await params
  
  const { data, error, response } = await apiClient.GET("/api/v1/commerce/{id}", {
    params: {
      path: { id }
    },
    cache: "no-store"
  })
  
  if (response.status === 404 || error || !data) {
    notFound()
  }

  const purchase = data as ExtendedPurchase

  return (
    <div className="max-w-6xl mx-auto">
      <PurchaseDetailView purchase={purchase} />
    </div>
  )
}
