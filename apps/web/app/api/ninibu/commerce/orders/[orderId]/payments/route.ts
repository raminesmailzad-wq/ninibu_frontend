import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) { const { orderId } = await params; const idempotencyKey = request.headers.get("idempotency-key") ?? crypto.randomUUID(); const result = await authorizedBackend(apiPaths.orderPayments(orderId), { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(await request.json()) }); return NextResponse.json(result.body, { status: result.status }); }
