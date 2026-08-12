import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(_request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const result = await authorizedBackend(apiPaths.communityGroupJoin(groupId), { method: "POST" });
  return NextResponse.json(result.body, { status: result.status });
}
