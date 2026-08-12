import { NextResponse } from "next/server";import { authorizedBackend } from "@/lib/backend";import { apiPaths } from "@ninibu/api";
export async function GET(){const r=await authorizedBackend(apiPaths.children);return NextResponse.json(r.body,{status:r.status})}
export async function POST(req:Request){const r=await authorizedBackend(apiPaths.children,{method:"POST",body:JSON.stringify(await req.json())});return NextResponse.json(r.body,{status:r.status})}
