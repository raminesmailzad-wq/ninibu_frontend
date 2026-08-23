import { NextResponse } from "next/server";
import { authorizedBackend } from "@/lib/backend";

async function forward(request: Request, { params }: { params: Promise<{ path: string[] }> }, method: string) {
  const { path } = await params;
  const suffix = path.map((part) => encodeURIComponent(part)).join("/");
  const search = new URL(request.url).search;
  const hasBody = !["GET", "HEAD"].includes(method);
  const rawBody = hasBody ? await request.text() : undefined;
  const result = await authorizedBackend(`/api/v1/admin/${suffix}${search}`, {
    method,
    ...(rawBody ? { body: rawBody } : {}),
  });
  if (result.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(result.body, { status: result.status });
}

export const GET = (request: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(request, ctx, "GET");
export const POST = (request: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(request, ctx, "POST");
export const PUT = (request: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(request, ctx, "PUT");
export const PATCH = (request: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(request, ctx, "PATCH");
export const DELETE = (request: Request, ctx: { params: Promise<{ path: string[] }> }) => forward(request, ctx, "DELETE");
