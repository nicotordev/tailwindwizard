import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  await params;
  // const { jobId } = await params;
  // const result = await apiClient.GET("/api/v1/render/{jobId}", {
  //   params: {
  //     path: { jobId },
  //   },
  // });
  // return handleApiResponse(result);
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
