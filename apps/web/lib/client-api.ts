import type { ApiEnvelope } from "@ninibu/types";

export class NinibuApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "UNKNOWN", status = 500) {
    super(message);
    this.name = "NinibuApiError";
    this.code = code;
    this.status = status;
  }
}

export async function clientApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!body.success) {
    throw new NinibuApiError(body.error.message || "خطا در ارتباط با سرور", body.error.code, response.status);
  }
  return body.data;
}
