import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../proxy-utils";

export async function GET() {
  const result = await apiClient.GET("/api/v1/creators/me");
  return handleApiResponse(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await apiClient.POST("/api/v1/creators/me", {
    body,
  } as any);
  return handleApiResponse(result);
}
