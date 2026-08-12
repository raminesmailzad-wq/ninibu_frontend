import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(request: Request) {
  const result = await authorizedBackend(`${apiPaths.communityFeed}${new URL(request.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}
