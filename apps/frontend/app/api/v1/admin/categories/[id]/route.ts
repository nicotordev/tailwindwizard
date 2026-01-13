import type { NextRequest } from "next/server";
import { apiClient } from "@/lib/api";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await ctx.params).id;
    const category = await apiClient.GET("/api/v1/admin/categories/{id}", {
      params: {
        path: { id },
      },
    });
    return Response.json(category, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
