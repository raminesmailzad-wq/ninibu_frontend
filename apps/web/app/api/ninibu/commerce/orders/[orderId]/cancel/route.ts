import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) { const { orderId } = await params; let payload: unknown = {}; try { payload = await request.json(); } catch {} const result = await authorizedBackend(apiPaths.commerceOrderCancel(orderId), { method: "POST", body: JSON.stringify(payload) }); return NextResponse.json(result.body, { status: result.status }); }
