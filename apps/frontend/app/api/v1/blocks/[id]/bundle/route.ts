import { apiClient } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { handleApiResponse } from "../../../proxy-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const bundle = formData.get("bundle");

  if (!(bundle instanceof File)) {
    return NextResponse.json(
      { message: "Bundle file is required." },
      { status: 400 }
    );
  }

  const body = new FormData();
  body.set("bundle", bundle);

  const result = await apiClient.POST("/api/v1/blocks/{id}/bundle", {
    params: { path: { id } },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: body as any,
  });

  return handleApiResponse(result);
}
