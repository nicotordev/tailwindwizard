import { CollectionDetailsView } from "@/components/dashboard/collections/collection-details-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection Details | TailwindWizard",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <CollectionDetailsView collectionId={id} />
    </div>
  );
}
