import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(_request: Request, { params }: { params: Promise<{ paymentId: string }> }) { const { paymentId } = await params; const result = await authorizedBackend(apiPaths.payment(paymentId)); return NextResponse.json(result.body, { status: result.status }); }
