import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET() {
  const result = await authorizedBackend(apiPaths.communityProfile);
  return NextResponse.json(result.body, { status: result.status });
}
export async function PUT(request: Request) {
  const result = await authorizedBackend(apiPaths.communityProfile, { method: "PUT", body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
