import type { ApiEnvelope } from "@ninibu/types";

export type ApiFailure = { code?: string; message?: string };

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

export function resolveApiErrorMessage(failure?: ApiFailure, status = 500, fallback = "خطا در ارتباط با سرور") {
  const code = String(failure?.code ?? "").trim().toUpperCase();
  const message = String(failure?.message ?? "").trim();

  const codeMap: Record<string, string> = {
    UNAUTHORIZED: "دسترسی شما معتبر نیست. لطفاً دوباره وارد شوید.",
    INVALID_CREDENTIALS: "اطلاعات ورود صحیح نیست.",
    FORBIDDEN: "شما به این بخش دسترسی ندارید.",
    PASSWORD_SETUP_REQUIRED: "برای این حساب باید ابتدا رمز عبور تعیین شود.",
    ACCOUNT_EXISTS: "این شماره قبلاً ثبت شده است.",
    ACCOUNT_NOT_FOUND: "حسابی با این شماره پیدا نشد.",
    VALIDATION_ERROR: "اطلاعات واردشده معتبر نیست.",
    INVALID_REQUEST: "اطلاعات واردشده معتبر نیست.",
    NOT_FOUND: "مورد درخواستی پیدا نشد.",
    CONFLICT: "این عملیات با وضعیت فعلی سازگار نیست.",
    OTP_RESEND_LIMIT: "تعداد درخواست کد زیاد بوده است. کمی بعد دوباره تلاش کنید.",
    OTP_HOURLY_LIMIT: "تعداد درخواست کد زیاد بوده است. کمی بعد دوباره تلاش کنید.",
    TOO_MANY_REQUESTS: "تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.",
    RATE_LIMITED: "تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.",
  };
  if (code && codeMap[code]) return codeMap[code];

  if (message) {
    if (/[؀-ۿ]/.test(message)) return message;

    const normalized = message.toLowerCase();
    const phraseMap: Array<[RegExp, string]> = [
      [/session not found|missing session|no session/, "نشست کاربری شما پیدا نشد. لطفاً دوباره وارد شوید."],
      [/unauthorized|invalid token|token expired/, "دسترسی شما معتبر نیست. لطفاً دوباره وارد شوید."],
      [/invalid credentials|wrong password|bad credentials/, "اطلاعات ورود صحیح نیست."],
      [/forbidden|access denied/, "شما به این بخش دسترسی ندارید."],
      [/not found|record not found/, "مورد درخواستی پیدا نشد."],
      [/validation|invalid request|bad request/, "اطلاعات واردشده معتبر نیست."],
      [/too many requests|rate limit/, "تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید."],
      [/internal server error|unexpected error|server error/, "در پردازش درخواست خطایی رخ داد. لطفاً دوباره تلاش کنید."],
    ];
    const match = phraseMap.find(([pattern]) => pattern.test(normalized));
    if (match) return match[1];
  }

  if (status === 401) return "دسترسی شما معتبر نیست. لطفاً دوباره وارد شوید.";
  if (status === 403) return "شما به این بخش دسترسی ندارید.";
  if (status === 404) return "مورد درخواستی پیدا نشد.";
  if (status === 409) return "این عملیات با وضعیت فعلی سازگار نیست.";
  if (status === 422) return "اطلاعات واردشده معتبر نیست.";
  if (status === 429) return "تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.";
  if (status >= 500) return "در پردازش درخواست خطایی رخ داد. لطفاً دوباره تلاش کنید.";

  return fallback;
}

export function toApiError(failure?: ApiFailure, status = 500, fallback = "خطا در ارتباط با سرور") {
  return new NinibuApiError(resolveApiErrorMessage(failure, status, fallback), failure?.code || "UNKNOWN", status);
}

export async function clientApi<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
    response = await fetch(url, {
      ...init,
      headers: {
        ...(init?.body && !isFormData ? { "content-type": "application/json" } : {}),
        ...(init?.headers ?? {})
      },
      cache: "no-store"
    });
  } catch {
    throw new NinibuApiError("ارتباط با سرور برقرار نشد. اتصال اینترنت یا وضعیت سرویس را بررسی کنید.", "NETWORK_ERROR", 0);
  }

  if (response.status === 204) return undefined as T;

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    if (!response.ok) throw new NinibuApiError(resolveApiErrorMessage(undefined, response.status), "UNKNOWN", response.status);
    throw new NinibuApiError("پاسخ دریافتی از سرور قابل خواندن نیست.", "INVALID_RESPONSE", response.status);
  }

  if (!body.success) {
    throw toApiError(body.error, response.status);
  }
  return body.data;
}
