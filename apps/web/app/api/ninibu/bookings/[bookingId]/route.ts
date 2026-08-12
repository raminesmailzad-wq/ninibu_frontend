import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(_request: Request, { params }: { params: Promise<{ bookingId: string }> }) { const { bookingId } = await params; const result = await authorizedBackend(apiPaths.booking(bookingId)); return NextResponse.json(result.body, { status: result.status }); }
