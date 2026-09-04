import { NextResponse } from "next/server";
import { apiPaths } from "@ninibu/api";
import type { DocumentImport } from "@ninibu/types";
import { authorizedBackend } from "@/lib/backend";

type Params = { params: Promise<{ childId: string; importId: string }> };
export async function GET(_req: Request, { params }: Params) {
  const { childId, importId } = await params;
  const result = await authorizedBackend<DocumentImport>(apiPaths.childDocumentImport(childId, importId));
  return NextResponse.json(result.body, { status: result.status });
}
export async function DELETE(_req: Request, { params }: Params) {
  const { childId, importId } = await params;
  const result = await authorizedBackend(apiPaths.childDocumentImport(childId, importId), { method: "DELETE" });
  if (result.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(result.body, { status: result.status });
}
