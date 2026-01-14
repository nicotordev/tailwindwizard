import { apiClient } from "@/lib/api";
import { handleApiResponse } from "../../proxy-utils";
import { NextRequest } from "next/server";

export async function GET() {
  const result = await apiClient.GET("/api/v1/admin/tags");
  return handleApiResponse(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await apiClient.POST("/api/v1/admin/tags", {
    body,
  });
  return handleApiResponse(result);
}
