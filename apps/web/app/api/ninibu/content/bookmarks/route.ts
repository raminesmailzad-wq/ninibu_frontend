import { NextResponse } from "next/server"; import { authorizedBackend } from "@/lib/backend"; import { apiPaths } from "@ninibu/api";
export async function GET() { const result = await authorizedBackend(apiPaths.contentBookmarks); return NextResponse.json(result.body, { status: result.status }); }
