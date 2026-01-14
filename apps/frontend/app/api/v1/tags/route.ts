import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../proxy-utils";
export async function GET() {
  const tags = await apiClient.GET("/api/v1/tags");
  return handleApiResponse(tags);
}
