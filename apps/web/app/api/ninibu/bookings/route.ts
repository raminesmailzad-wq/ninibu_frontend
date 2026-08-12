import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function GET(request: Request) {
  const result = await authorizedBackend(`${apiPaths.bookings}${new URL(request.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("idempotency-key") ?? crypto.randomUUID();
  const result = await authorizedBackend(apiPaths.bookings, { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
