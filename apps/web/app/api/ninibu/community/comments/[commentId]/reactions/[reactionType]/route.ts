import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function DELETE(_request: Request, { params }: { params: Promise<{ commentId: string; reactionType: string }> }) {
  const { commentId, reactionType } = await params;
  const result = await authorizedBackend(apiPaths.communityCommentReaction(commentId, reactionType), { method: "DELETE" });
  return result.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status });
}
