import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(req: Request) {
  const result = await authorizedBackend(`${apiPaths.recommendations}${new URL(req.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}
