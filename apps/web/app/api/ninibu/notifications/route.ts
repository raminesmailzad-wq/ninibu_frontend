import { NextResponse } from "next/server";
import { notificationApiPaths } from "@ninibu/api";
import { authorizedBackend } from "@/lib/backend";

export async function GET(request: Request) {
  const result = await authorizedBackend(`${notificationApiPaths.notifications}${new URL(request.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}
