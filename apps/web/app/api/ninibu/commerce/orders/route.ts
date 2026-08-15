import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(request: Request) { const result = await authorizedBackend(`${apiPaths.commerceOrders}${new URL(request.url).search}`); return NextResponse.json(result.body, { status: result.status }); }
export async function POST(request: Request) { const idempotencyKey = request.headers.get("idempotency-key") ?? crypto.randomUUID(); let payload: unknown = {}; try { payload = await request.json(); } catch {} const result = await authorizedBackend(apiPaths.commerceOrders, { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(payload) }); return NextResponse.json(result.body, { status: result.status }); }
