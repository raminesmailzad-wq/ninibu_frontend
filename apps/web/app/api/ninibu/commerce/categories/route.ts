import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET() { const result = await rawBackend(apiPaths.commerceCategories); return NextResponse.json(result.body, { status: result.status }); }
