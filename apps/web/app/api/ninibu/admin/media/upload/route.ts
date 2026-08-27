import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "فرمت آپلود معتبر نیست." } }, { status: 400 });
  }
  const body = await request.arrayBuffer();
  const result = await authorizedBackend("/api/v1/admin/media/upload", { method: "POST", body, headers: { "content-type": contentType } });
  return NextResponse.json(result.body, { status: result.status });
}
