import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../../proxy-utils";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await apiClient.GET("/api/v1/blocks/render-jobs/{jobId}", {
    params: {
      path: { jobId },
    },
  });
  return handleApiResponse(result);
}
