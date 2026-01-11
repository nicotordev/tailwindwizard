import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T, E> {
  data?: T;
  error?: E;
  response: Response;
}

export function handleApiResponse<T, E>({
  data,
  error,
  response,
}: ApiResponse<T, E>) {
  if (error) {
    return NextResponse.json(error, { status: response.status });
  }
  return NextResponse.json(data);
}

export function getQueryParams(req: NextRequest): Record<string, string> {
  const { searchParams } = new URL(req.url);
  return Object.fromEntries(searchParams.entries());
}