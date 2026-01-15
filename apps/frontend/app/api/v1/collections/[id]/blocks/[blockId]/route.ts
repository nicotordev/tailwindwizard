import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";
import { handleApiResponse } from "../../../../proxy-utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const { id, blockId } = await params;
  const result = await apiClient.POST("/api/v1/collections/{id}/blocks/{blockId}", {
    params: {
      path: { id, blockId },
    },
  });
  return handleApiResponse(result);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const { id, blockId } = await params;
  const result = await apiClient.DELETE("/api/v1/collections/{id}/blocks/{blockId}", {
    params: {
      path: { id, blockId },
    },
  });
  return handleApiResponse(result);
}