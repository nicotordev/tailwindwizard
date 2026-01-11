import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse, getQueryParams } from "../proxy-utils";

export async function GET(req: NextRequest) {
  const result = await apiClient.GET("/api/v1/blocks", {
    params: {
      query: getQueryParams(req),
    },
  });
  return handleApiResponse(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await apiClient.POST("/api/v1/blocks", {
    body,
  });
  return handleApiResponse(result);
}
