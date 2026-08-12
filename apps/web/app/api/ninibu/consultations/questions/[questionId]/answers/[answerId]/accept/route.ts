import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function POST(_request: Request, { params }: { params: Promise<{ questionId: string; answerId: string }> }) {
  const { questionId, answerId } = await params;
  const result = await authorizedBackend(apiPaths.consultationAnswerAccept(questionId, answerId), { method: "POST" });
  return NextResponse.json(result.body, { status: result.status });
}
