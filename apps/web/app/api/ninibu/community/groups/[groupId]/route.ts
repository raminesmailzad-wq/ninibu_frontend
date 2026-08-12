import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(_request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const result = await authorizedBackend(apiPaths.communityGroup(groupId));
  return NextResponse.json(result.body, { status: result.status });
}
