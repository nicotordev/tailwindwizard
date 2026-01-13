import { apiClient } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const categories = await apiClient.POST("/api/v1/admin/categories", body);
    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await apiClient.GET("/api/v1/admin/categories");
    return Response.json(categories, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
