import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const result = await authorizedBackend(`${apiPaths.communityGroupPosts(groupId)}${new URL(request.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}
export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const result = await authorizedBackend(apiPaths.communityGroupPosts(groupId), { method: "POST", body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
