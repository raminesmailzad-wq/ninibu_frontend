import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) { const { orderId } = await params; const result = await authorizedBackend(apiPaths.commerceOrder(orderId)); return NextResponse.json(result.body, { status: result.status }); }
