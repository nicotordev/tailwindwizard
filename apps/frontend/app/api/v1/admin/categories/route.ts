import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../proxy-utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await apiClient.POST("/api/v1/admin/categories", {
    body,
  });
  return handleApiResponse(result);
}

export async function GET() {
  const result = await apiClient.GET("/api/v1/admin/categories");
  return handleApiResponse(result);
}
