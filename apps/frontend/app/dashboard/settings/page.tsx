import { apiClient } from "@/lib/api";
import { SettingsView } from "@/components/settings/settings-view";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { data: user, error: userError } = await apiClient.GET("/api/v1/users/me");

  if (userError || !user) {
    // If user fetch fails, likely auth issue, redirect or show error
    // But since middleware protects it, maybe just redirect to sign-in just in case
    // Or render an error state.
    // userError might be 401.
    redirect("/sign-in");
  }

  // Fetch creator profile, ignoring 404 which means not a creator yet
  const { data: creator } = await apiClient.GET("/api/v1/creators/me");

  return (
    <div className="flex flex-col gap-8 w-full">
      <SettingsView user={user} creator={creator || null} />
    </div>
  );
}
