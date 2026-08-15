import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) { const { itemId } = await params; const result = await authorizedBackend(apiPaths.commerceCartItem(itemId), { method: "PATCH", body: JSON.stringify(await request.json()) }); return NextResponse.json(result.body, { status: result.status }); }
export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) { const { itemId } = await params; const result = await authorizedBackend(apiPaths.commerceCartItem(itemId), { method: "DELETE" }); return NextResponse.json(result.body, { status: result.status }); }
