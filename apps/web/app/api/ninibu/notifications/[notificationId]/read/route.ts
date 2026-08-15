import { NextResponse } from "next/server";
import { notificationApiPaths } from "@ninibu/api";
import { authorizedBackend } from "@/lib/backend";

export async function POST(_request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  const { notificationId } = await params;
  const result = await authorizedBackend(notificationApiPaths.notificationRead(notificationId), { method: "POST" });
  return result.status === 204
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(result.body, { status: result.status });
}
