import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function POST(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const result = await authorizedBackend(apiPaths.consultationQuestionAnswers(questionId), { method: "POST", body: JSON.stringify(await request.json()) });
  return NextResponse.json(result.body, { status: result.status });
}
