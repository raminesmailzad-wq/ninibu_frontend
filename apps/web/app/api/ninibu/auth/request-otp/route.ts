import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(request: Request) {
  const payload = await request.json();
  const result = await rawBackend(apiPaths.requestOtp,{method:"POST",body:JSON.stringify(payload)});
  return NextResponse.json(result.body,{status:result.status});
}
