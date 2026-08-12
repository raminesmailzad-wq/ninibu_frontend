import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
import type { Profile, User } from "@ninibu/types";
export async function GET() {
  const me=await authorizedBackend<User>(apiPaths.me);
  if(!me.body.success) return NextResponse.json({success:true,data:{authenticated:false}},{status:200});
  const profile=await authorizedBackend<Profile>(apiPaths.profile);
  return NextResponse.json({success:true,data:{authenticated:true,user:me.body.data,onboardingCompleted:profile.body.success ? profile.body.data.onboarding_completed : false}},{status:200});
}
