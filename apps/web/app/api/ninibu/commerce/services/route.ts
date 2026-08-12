import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(request: Request) { const result = await rawBackend(`${apiPaths.commerceServices}${new URL(request.url).search}`); return NextResponse.json(result.body, { status: result.status }); }
