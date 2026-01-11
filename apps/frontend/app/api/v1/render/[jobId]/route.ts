import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../proxy-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const result = await apiClient.GET("/api/v1/render/{jobId}", {
    params: {
      path: { jobId },
    },
  });
  return handleApiResponse(result);
}
