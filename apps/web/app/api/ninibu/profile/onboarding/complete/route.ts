import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function POST(req:Request){const r=await authorizedBackend(apiPaths.onboardingComplete,{method:"POST",body:JSON.stringify(await req.json())});return NextResponse.json(r.body,{status:r.status})}
