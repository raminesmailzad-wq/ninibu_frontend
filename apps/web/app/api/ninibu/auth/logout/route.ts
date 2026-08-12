import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/backend";
export async function POST(){await clearSessionCookies();return NextResponse.json({success:true,data:{logged_out:true}})}
