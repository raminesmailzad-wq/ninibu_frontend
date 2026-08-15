import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function GET(request: Request, { params }: { params: Promise<{ placementCode: string }> }) {
  const { placementCode } = await params;
  const result = await authorizedBackend(`${apiPaths.advertisingPlacementItems(placementCode)}${new URL(request.url).search}`);
  return NextResponse.json(result.body, { status: result.status });
}
