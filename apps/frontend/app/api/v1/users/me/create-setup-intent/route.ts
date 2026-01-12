import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../../../proxy-utils";

export async function POST() {
  const result = await apiClient.POST("/api/v1/users/me/create-setup-intent");
  return handleApiResponse(result);
}
