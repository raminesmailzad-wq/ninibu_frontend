import { NextResponse } from "next/server";
import { notificationApiPaths } from "@ninibu/api";
import { authorizedBackend } from "@/lib/backend";

export async function POST() {
  const result = await authorizedBackend(notificationApiPaths.notificationsReadAll, { method: "POST" });
  return result.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(result.body, { status: result.status });
}
