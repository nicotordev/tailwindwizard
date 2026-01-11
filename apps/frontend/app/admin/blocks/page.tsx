import { apiClient } from "@/lib/api";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { Badge } from "@/components/ui/badge";

export default async function AdminBlocksPage() {
  const { data, error } = await apiClient.GET("/api/v1/admin/moderation", {
    cache: "no-store",
  });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Moderation</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Block moderation
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Review submitted blocks and decide if they are ready for the
          marketplace.
        </p>
      </div>

      <ModerationQueue initialBlocks={error ? [] : data?.data || []} />
    </div>
  );
}
