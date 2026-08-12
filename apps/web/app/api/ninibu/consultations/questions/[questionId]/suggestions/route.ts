import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";

export async function GET(_request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const result = await authorizedBackend(apiPaths.consultationQuestionSuggestions(questionId));
  return NextResponse.json(result.body, { status: result.status });
}
