import { NextResponse } from "next/server";

const backendURL = () => process.env.NINIBU_BACKEND_URL ?? "http://localhost:8081";

export async function GET(_: Request, { params }: { params: Promise<{ storageKey: string }> }) {
  const { storageKey } = await params;
  if (!/^[a-f0-9]{40}\.(?:jpe?g|png|webp|gif|pdf|txt|csv|docx?|xlsx?|pptx?)$/i.test(storageKey)) {
    return new NextResponse(null, { status: 404 });
  }
  const response = await fetch(`${backendURL()}/api/v1/media/${encodeURIComponent(storageKey)}`, { cache: "no-store" });
  if (!response.ok) return new NextResponse(null, { status: response.status });
  const headers = new Headers();
  for (const key of ["content-type", "content-disposition", "cache-control", "content-length"]) {
    const value = response.headers.get(key); if (value) headers.set(key, value);
  }
  headers.set("x-content-type-options", "nosniff");
  return new NextResponse(response.body, { status: 200, headers });
}
