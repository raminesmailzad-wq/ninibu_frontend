import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(req: Request, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const result = await authorizedBackend(`${apiPaths.childVaccinations(childId)}${new URL(req.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}
export async function POST(req: Request, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const result = await authorizedBackend(apiPaths.childVaccinations(childId), { method: "POST", body: JSON.stringify(await req.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
