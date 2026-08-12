import { cookies } from "next/headers";
import { apiPaths } from "@ninibu/api";
import type { ApiEnvelope } from "@ninibu/types";

const ACCESS_COOKIE = "ninibu_access";
const REFRESH_COOKIE = "ninibu_refresh";
const backendURL = () => process.env.NINIBU_BACKEND_URL ?? "http://localhost:8080";

export async function rawBackend<T>(path: string, init: RequestInit = {}): Promise<{status:number; body: ApiEnvelope<T>}> {
  const response = await fetch(`${backendURL()}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store"
  });
  if (response.status === 204) {
    return { status: response.status, body: { success: true, data: undefined as T } };
  }
  const body = await response.json() as ApiEnvelope<T>;
  return { status: response.status, body };
}

async function refreshAccessToken(): Promise<string | null> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;
  const result = await rawBackend<{access_token:string;refresh_token:string;access_expires_at:string;refresh_expires_at:string}>(apiPaths.refresh, {
    method: "POST",
    body: JSON.stringify({ refresh_token: refresh })
  });
  if (!result.body.success) return null;
  store.set(ACCESS_COOKIE, result.body.data.access_token, cookieOptions(new Date(result.body.data.access_expires_at)));
  store.set(REFRESH_COOKIE, result.body.data.refresh_token, cookieOptions(new Date(result.body.data.refresh_expires_at)));
  return result.body.data.access_token;
}

export async function authorizedBackend<T>(path: string, init: RequestInit = {}): Promise<{status:number; body: ApiEnvelope<T>}> {
  const store = await cookies();
  let token = store.get(ACCESS_COOKIE)?.value;
  if (!token) token = await refreshAccessToken() ?? undefined;
  if (!token) return {status:401, body:{success:false,error:{code:"UNAUTHORIZED",message:"session not found"}}};
  let result = await rawBackend<T>(path, {...init, headers:{...(init.headers ?? {}), authorization:`Bearer ${token}`}});
  if (result.status === 401) {
    token = await refreshAccessToken() ?? undefined;
    if (token) result = await rawBackend<T>(path, {...init, headers:{...(init.headers ?? {}), authorization:`Bearer ${token}`}});
  }
  return result;
}

export function cookieOptions(expires?: Date) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", ...(expires ? {expires} : {}) };
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", {...cookieOptions(), maxAge:0});
  store.set(REFRESH_COOKIE, "", {...cookieOptions(), maxAge:0});
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
