import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse, getQueryParams } from "../../proxy-utils";

export async function GET(req: NextRequest) {
  const result = await apiClient.GET("/api/v1/admin/moderation", {
    params: {
      query: getQueryParams(req),
    },
  });
  return handleApiResponse(result);
}
