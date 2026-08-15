import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function POST(request: Request) {
  const result = await authorizedBackend(apiPaths.advertisingEvents, { method: "POST", body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
