import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(request: Request, { params }: { params: Promise<{ serviceId: string }> }) { const { serviceId } = await params; const result = await rawBackend(`${apiPaths.serviceAvailability(serviceId)}${new URL(request.url).search}`); return NextResponse.json(result.body, { status: result.status }); }
