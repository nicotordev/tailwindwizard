import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../../../proxy-utils";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const result = await apiClient.GET("/api/v1/creators/me/blocks", {
    params: {
      query: {
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 20,
        q: searchParams.get("q") || undefined,
      },
    },
  });
  return handleApiResponse(result);
}
