import { NextResponse } from "next/server";import { rawBackend } from "@/lib/backend";import { apiPaths } from "@ninibu/api";
export async function GET(){const r=await rawBackend(apiPaths.countries);return NextResponse.json(r.body,{status:r.status})}
