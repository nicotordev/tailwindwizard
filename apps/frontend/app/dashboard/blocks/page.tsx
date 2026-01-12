import { Metadata } from "next";
import { apiClient } from "@/lib/api";
import { CreatorBlocksView } from "@/components/creator/blocks-view";

export const metadata: Metadata = {
  title: "My Blocks | TailwindWizard",
  description: "Manage your component library.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CreatorBlocksPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const search =
    typeof searchParams.q === "string" ? searchParams.q : undefined;

  const { data, error } = await apiClient.GET("/api/v1/creators/me/blocks", {
    params: {
      query: {
        page,
        limit,
        q: search,
      },
    },
    cache: "no-store",
  });

  if (error || !data) {
    throw new Error("Failed to fetch blocks");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <CreatorBlocksView blocks={data.data || []} meta={data.meta} />
    </div>
  );
}
