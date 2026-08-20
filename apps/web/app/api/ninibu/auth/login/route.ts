import { NextResponse } from "next/server";
import { rawBackend, setSessionCookies } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
import type { User } from "@ninibu/types";

type TokenResponse={access_token:string;access_expires_at:string;refresh_token:string;refresh_expires_at:string;user:User};

export async function POST(request: Request) {
  const result = await rawBackend<TokenResponse>(apiPaths.login,{method:"POST",body:JSON.stringify(await request.json())});
  if (result.body.success) {
    await setSessionCookies(result.body.data);
    return NextResponse.json({success:true,data:{user:result.body.data.user}},{status:result.status});
  }
  return NextResponse.json(result.body,{status:result.status});
}
