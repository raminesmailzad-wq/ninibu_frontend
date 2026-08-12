import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function PATCH(request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const { commentId } = await params;
  const result = await authorizedBackend(apiPaths.communityComment(commentId), { method: "PATCH", body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
export async function DELETE(_request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const { commentId } = await params;
  const result = await authorizedBackend(apiPaths.communityComment(commentId), { method: "DELETE" });
  return result.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status });
}
