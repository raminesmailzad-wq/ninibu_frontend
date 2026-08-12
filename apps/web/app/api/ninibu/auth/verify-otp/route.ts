import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { rawBackend, cookieOptions, ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
import type { User } from "@ninibu/types";
type TokenResponse={access_token:string;access_expires_at:string;refresh_token:string;refresh_expires_at:string;user:User};
export async function POST(request: Request) {
  const payload = await request.json();
  const result = await rawBackend<TokenResponse>(apiPaths.verifyOtp,{method:"POST",body:JSON.stringify(payload)});
  if (result.body.success) {
    const store=await cookies();
    store.set(ACCESS_COOKIE,result.body.data.access_token,cookieOptions(new Date(result.body.data.access_expires_at)));
    store.set(REFRESH_COOKIE,result.body.data.refresh_token,cookieOptions(new Date(result.body.data.refresh_expires_at)));
    return NextResponse.json({success:true,data:{user:result.body.data.user}},{status:result.status});
  }
  return NextResponse.json(result.body,{status:result.status});
}
