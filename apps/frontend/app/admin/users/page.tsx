import { apiClient } from "@/lib/api";
import { UserManager } from "@/components/admin/user-manager";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const { data, error } = await apiClient.GET("/api/v1/admin/users", {
    cache: "no-store",
  });

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Users</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          User management
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Manage user roles and monitor platform activity.
        </p>
      </div>

      <UserManager
        initialUsers={error ? [] : data?.data || []}
        meta={data?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 }}
      />
    </div>
  );
}
