import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../proxy-utils";

export async function GET() {
  const result = await apiClient.GET("/api/v1/users/me");
  return handleApiResponse(result);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const result = await apiClient.PATCH("/api/v1/users/me", {
    body,
  });
  return handleApiResponse(result);
}