import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function DELETE(_request: Request, { params }: { params: Promise<{ postId: string; reactionType: string }> }) {
  const { postId, reactionType } = await params;
  const result = await authorizedBackend(apiPaths.communityPostReaction(postId, reactionType), { method: "DELETE" });
  return result.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status });
}
