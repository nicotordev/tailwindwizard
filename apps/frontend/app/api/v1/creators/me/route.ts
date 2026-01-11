import { apiClient } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { data, error } = await apiClient.GET("/api/v1/creators/me");
  if (error) return NextResponse.json(error, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error, response } = await apiClient.POST("/api/v1/creators/me", { body });
  
  if (error) {
      if (response.status === 409) {
          // Already exists, fetch existing or just return success (empty)
          // We can try to fetch it or just return a dummy success if the client handles it.
          // Better: Return the existing creator? 
          // But I can't easily fetch it here without another call.
          // Let's just return { success: true, message: "Already exists" } or similar, 
          // but the client expects Creator object.
          // Let's fetch it.
          const { data: existingData } = await apiClient.GET("/api/v1/creators/me");
          return NextResponse.json(existingData);
      }
      return NextResponse.json(error, { status: response.status });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await apiClient.PATCH("/api/v1/creators/me", { body });
  if (error) return NextResponse.json(error, { status: 500 });
  return NextResponse.json(data);
}
