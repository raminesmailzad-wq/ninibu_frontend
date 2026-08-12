import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(_request: Request, { params }: { params: Promise<{ serviceId: string }> }) { const { serviceId } = await params; const result = await rawBackend(apiPaths.commerceService(serviceId)); return NextResponse.json(result.body, { status: result.status }); }
