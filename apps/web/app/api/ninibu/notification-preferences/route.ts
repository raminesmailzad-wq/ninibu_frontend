import { NextResponse } from "next/server";
import { notificationApiPaths } from "@ninibu/api";
import { authorizedBackend } from "@/lib/backend";

export async function GET() {
  const result = await authorizedBackend(notificationApiPaths.notificationPreferences);
  return NextResponse.json(result.body, { status: result.status });
}

export async function PATCH(request: Request) {
  const result = await authorizedBackend(notificationApiPaths.notificationPreferences, {
    method: "PATCH",
    body: JSON.stringify(await request.json())
  });
  return NextResponse.json(result.body, { status: result.status });
}
