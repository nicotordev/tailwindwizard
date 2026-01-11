import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../../../../proxy-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  const { blockId } = await params;
  const body = await req.json();
  const result = await apiClient.POST(
    "/api/v1/admin/moderation/{blockId}/decide",
    {
      params: {
        path: { blockId },
      },
      body,
    }
  );
  return handleApiResponse(result);
}