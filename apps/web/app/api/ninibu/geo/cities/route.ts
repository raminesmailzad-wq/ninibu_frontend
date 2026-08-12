import { NextResponse } from "next/server";import { rawBackend } from "@/lib/backend";import { apiPaths } from "@ninibu/api";
export async function GET(req:Request){const q=new URL(req.url).searchParams.toString();const r=await rawBackend(`${apiPaths.cities}?${q}`);return NextResponse.json(r.body,{status:r.status})}
