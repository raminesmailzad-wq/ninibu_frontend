import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET() { const result = await authorizedBackend(apiPaths.commerceCart); return NextResponse.json(result.body, { status: result.status }); }
export async function DELETE() { const result = await authorizedBackend(apiPaths.commerceCart, { method: "DELETE" }); return NextResponse.json(result.body, { status: result.status }); }
