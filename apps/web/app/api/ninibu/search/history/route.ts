import { NextResponse } from "next/server"; import { authorizedBackend } from "@/lib/backend"; import { apiPaths } from "@ninibu/api";
export async function GET(request: Request) { const result = await authorizedBackend(`${apiPaths.searchHistory}${new URL(request.url).search}`); return NextResponse.json(result.body, { status: result.status }); }
export async function DELETE() { const result = await authorizedBackend(apiPaths.searchHistory, { method: "DELETE" }); return result.status === 204 ? new Response(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status }); }
