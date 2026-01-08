import { apiClient } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams;

  const { data, error } = await apiClient.GET("/api/v1/categories", {
    params: {
      query: {
        page: query.get("page") || "1",
        limit: query.get("limit") || "10",
        search: query.get("search") || "",
      },
    },
  });

  if (error) {
    return NextResponse.json(error, { status: 500 });
  }

  return NextResponse.json(data);
}
