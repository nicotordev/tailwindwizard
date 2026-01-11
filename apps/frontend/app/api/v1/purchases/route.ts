import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse, getQueryParams } from "../../proxy-utils";

export async function GET(req: NextRequest) {
  const result = await apiClient.GET("/api/v1/purchases", {
    params: {
      query: getQueryParams(req) as any,
    },
  });
  return handleApiResponse(result);
}
