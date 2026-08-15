import { NextResponse } from "next/server";
import { rawBackend } from "@/lib/backend";
import { apiPaths } from "@ninibu/api";
export async function GET(_request: Request, { params }: { params: Promise<{ productId: string }> }) { const { productId } = await params; const result = await rawBackend(apiPaths.commerceProduct(productId)); return NextResponse.json(result.body, { status: result.status }); }
