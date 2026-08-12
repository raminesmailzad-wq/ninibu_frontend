import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function GET(req: Request, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const search = new URL(req.url).search;
  const result = await authorizedBackend(`${apiPaths.childGrowthMeasurements(childId)}${search}`);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: Request, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const result = await authorizedBackend(apiPaths.childGrowthMeasurements(childId), { method: "POST", body: JSON.stringify(await req.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
