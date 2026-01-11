import { apiClient } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await apiClient.PATCH("/api/v1/users/me", {
    body,
  });

  if (error) {
    return NextResponse.json(error, { status: 500 });
  }

  return NextResponse.json(data);
}
