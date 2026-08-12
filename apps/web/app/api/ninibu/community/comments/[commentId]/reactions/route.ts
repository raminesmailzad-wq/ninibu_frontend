import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  const { commentId } = await params;
  const result = await authorizedBackend(apiPaths.communityCommentReactions(commentId), { method: "POST", body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
