import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../../../proxy-utils";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await apiClient.POST("/api/v1/blocks/{id}/submit", {
    params: { path: { id } },
  });
  return handleApiResponse(result);
}
