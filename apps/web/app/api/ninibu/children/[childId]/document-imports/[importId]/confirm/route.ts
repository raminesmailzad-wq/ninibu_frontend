import { NextResponse } from "next/server";
import { apiPaths } from "@ninibu/api";
import type { ConfirmDocumentImportResponse } from "@ninibu/types";
import { authorizedBackend } from "@/lib/backend";

export async function POST(req: Request, { params }: { params: Promise<{ childId: string; importId: string }> }) {
  const { childId, importId } = await params;
  const result = await authorizedBackend<ConfirmDocumentImportResponse>(apiPaths.childDocumentImportConfirm(childId, importId), { method: "POST", body: JSON.stringify(await req.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
