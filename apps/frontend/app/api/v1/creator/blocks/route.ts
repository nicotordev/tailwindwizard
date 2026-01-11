import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../../proxy-utils";

export async function GET() {
  const result = await apiClient.GET("/api/v1/creators/me/blocks");
  return handleApiResponse(result);
}
