import { apiClient } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const _params = await params;

  const { data, error } = await apiClient.GET("/api/v1/categories/:slug", {
    params: {
      path: {
        slug: _params.slug,
      },
    },
  });

  if (error) {
    return NextResponse.json(error, { status: 500 });
  }

  return NextResponse.json(data);
}
