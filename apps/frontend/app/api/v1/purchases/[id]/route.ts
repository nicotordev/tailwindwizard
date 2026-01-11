import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../../proxy-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await apiClient.GET("/api/v1/purchases/{id}", {
    params: {
      path: { id },
    },
  });
  return handleApiResponse(result);
}
