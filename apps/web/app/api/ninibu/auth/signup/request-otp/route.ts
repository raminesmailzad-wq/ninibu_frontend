import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(request: Request) {
  const result = await rawBackend(apiPaths.signupRequestOtp,{method:"POST",body:JSON.stringify(await request.json())});
  return NextResponse.json(result.body,{status:result.status});
}
