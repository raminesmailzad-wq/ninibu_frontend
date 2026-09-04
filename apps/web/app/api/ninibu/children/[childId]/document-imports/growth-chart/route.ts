import { NextResponse } from "next/server";
import { apiPaths } from "@ninibu/api";
import type { DocumentImport } from "@ninibu/types";
import { authorizedBackend } from "@/lib/backend";

export async function POST(req: Request, { params }: { params: Promise<{ childId: string }> }) {
  const { childId } = await params;
  const form = await req.formData();
  const result = await authorizedBackend<DocumentImport>(apiPaths.childDocumentGrowthImport(childId), { method: "POST", body: form });
  return NextResponse.json(result.body, { status: result.status });
}
