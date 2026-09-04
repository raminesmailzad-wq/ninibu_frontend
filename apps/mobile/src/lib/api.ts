import { apiPaths, notificationApiPaths } from '@ninibu/api';
import type { ApiEnvelope, User } from '@ninibu/types';
import { API_BASE_URL, API_DEBUG } from './config';
import { clearTokens, getDeviceId, getTokens, saveTokens, type StoredTokens } from './storage';

type TokenPayload = {
  access_token: string;
  refresh_token: string;
  access_expires_at?: string;
  refresh_expires_at?: string;
  user?: User;
};

type ApiFailure = { code?: string; message?: string; details?: unknown };

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 0,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<string | null> | null = null;

function debug(scope: string, message: string, meta?: Record<string, unknown>) {
  if (!API_DEBUG) return;
  if (meta) console.log(`[NINIBU:${scope}] ${message}`, meta);
  else console.log(`[NINIBU:${scope}] ${message}`);
}

export function resolveApiMessage(failure?: ApiFailure, status = 0, fallback = 'در ارتباط با سرور خطایی رخ داد.') {
  const code = String(failure?.code ?? '').trim().toUpperCase();
  const message = String(failure?.message ?? '').trim();
  const codeMap: Record<string, string> = {
    INVALID_CREDENTIALS: 'شماره موبایل یا رمز عبور صحیح نیست.',
    UNAUTHORIZED: 'نشست شما معتبر نیست. لطفاً دوباره وارد شوید.',
    FORBIDDEN: 'شما به این بخش دسترسی ندارید.',
    ACCOUNT_NOT_FOUND: 'حسابی با این شماره پیدا نشد.',
    ACCOUNT_EXISTS: 'این شماره موبایل قبلاً ثبت شده است.',
    ACCOUNT_DISABLED: 'این حساب در حال حاضر غیرفعال است.',
    PASSWORD_SETUP_REQUIRED: 'برای این حساب باید ابتدا رمز عبور تعیین شود.',
    INVALID_OTP: 'کد تأیید صحیح نیست.',
    OTP_EXPIRED: 'کد تأیید منقضی شده است. دوباره کد بگیرید.',
    OTP_RESEND_LIMIT: 'تعداد درخواست کد زیاد بوده است. کمی بعد دوباره تلاش کنید.',
    OTP_HOURLY_LIMIT: 'تعداد درخواست کد زیاد بوده است. کمی بعد دوباره تلاش کنید.',
    VALIDATION_ERROR: 'اطلاعات واردشده معتبر نیست.',
    INVALID_REQUEST: 'اطلاعات واردشده معتبر نیست.',
    NOT_FOUND: 'مورد درخواستی پیدا نشد.',
    CONFLICT: 'این عملیات با وضعیت فعلی سازگار نیست.',
    RATE_LIMITED: 'تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.',
    TOO_MANY_REQUESTS: 'تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.',
    INVALID_RESPONSE: 'پاسخ دریافتی از سرور قابل خواندن نیست.',
    NETWORK_ERROR: 'اتصال به سرور برقرار نشد. اینترنت گوشی را بررسی کنید.',
    DOCUMENT_SCAN_TOO_LARGE: 'حجم عکس زیاد است. عکس کم‌حجم‌تری بگیرید و دوباره تلاش کنید.',
    DOCUMENT_SCAN_UNSUPPORTED_IMAGE: 'فرمت عکس پشتیبانی نمی‌شود. از دوربین نینیبو عکس جدید بگیرید.',
    DOCUMENT_SCAN_CHART_NOT_FOUND: 'نمودار در تصویر پیدا نشد. کل نمودار را صاف و واضح داخل کادر قرار دهید.',
    DOCUMENT_SCAN_NO_INK: 'مسیر دست‌نویس آبی یا سرمه‌ای روی نمودار تشخیص داده نشد.',
    DOCUMENT_SCAN_LOW_CONFIDENCE: 'از این عکس مقدار قابل‌اعتمادی استخراج نشد. گوشی و دفترچه را عمودی نگه دارید و کل صفحه را صاف داخل کادر بگیرید.',
    DOCUMENT_SCAN_ANALYSIS_FAILED: 'تحلیل تصویر کامل نشد. عکس واضح‌تری بگیرید و دوباره تلاش کنید.',
    GROWTH_MEASUREMENT_CONFLICT: 'برای این تاریخ مقدار متفاوتی در پرونده وجود دارد. تاریخ را اصلاح یا این ردیف را رد کنید.',
    DOCUMENT_IMPORT_ALREADY_CONFIRMED: 'این انتقال قبلاً تأیید و ثبت شده است.',
    DOCUMENT_IMPORT_NOT_REVIEWABLE: 'این انتقال دیگر در وضعیت قابل بررسی نیست.',
  };
  if (codeMap[code]) return codeMap[code];

  if (message) {
    if (/[؀-ۿ]/.test(message)) return message;
    const normalized = message.toLowerCase();
    const phrases: Array<[RegExp, string]> = [
      [/invalid credentials|wrong password|bad credentials/, 'شماره موبایل یا رمز عبور صحیح نیست.'],
      [/unauthorized|invalid token|token expired|session not found/, 'نشست شما معتبر نیست. لطفاً دوباره وارد شوید.'],
      [/forbidden|access denied/, 'شما به این بخش دسترسی ندارید.'],
      [/not found|record not found/, 'مورد درخواستی پیدا نشد.'],
      [/validation|bad request|invalid request/, 'اطلاعات واردشده معتبر نیست.'],
      [/too many requests|rate limit/, 'تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.'],
      [/internal server error|server error|unexpected error/, 'در پردازش درخواست خطایی رخ داد. لطفاً دوباره تلاش کنید.'],
    ];
    const mapped = phrases.find(([pattern]) => pattern.test(normalized));
    if (mapped) return mapped[1];
  }

  if (status === 401) return 'نشست شما معتبر نیست. لطفاً دوباره وارد شوید.';
  if (status === 403) return 'شما به این بخش دسترسی ندارید.';
  if (status === 404) return 'مورد درخواستی پیدا نشد.';
  if (status === 409) return 'این عملیات با وضعیت فعلی سازگار نیست.';
  if (status === 422) return 'اطلاعات واردشده معتبر نیست.';
  if (status === 429) return 'تعداد درخواست‌ها زیاد بوده است. کمی بعد دوباره تلاش کنید.';
  if (status >= 500) return 'در پردازش درخواست خطایی رخ داد. لطفاً دوباره تلاش کنید.';
  return fallback;
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  if (response.status === 204) return { success: true, data: undefined as T };
  try {
    return await response.json() as ApiEnvelope<T>;
  } catch {
    debug('API', 'invalid JSON response', { status: response.status, url: response.url });
    return { success: false, error: { code: 'INVALID_RESPONSE', message: 'پاسخ سرور قابل خواندن نیست.' } };
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const tokens = await getTokens();
    debug('AUTH', 'refresh requested', { hasRefreshToken: !!tokens?.refreshToken, baseUrl: API_BASE_URL });
    if (!tokens?.refreshToken) return null;
    try {
      const url = `${API_BASE_URL}${apiPaths.refresh}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });
      const envelope = await parseEnvelope<TokenPayload>(response);
      debug('AUTH', 'refresh response', {
        status: response.status,
        success: envelope.success,
        errorCode: envelope.success ? undefined : envelope.error.code,
      });
      if (!envelope.success) {
        if (response.status === 401 || response.status === 403) await clearTokens();
        return null;
      }
      const next: StoredTokens = {
        accessToken: envelope.data.access_token,
        refreshToken: envelope.data.refresh_token,
        accessExpiresAt: envelope.data.access_expires_at,
        refreshExpiresAt: envelope.data.refresh_expires_at,
      };
      await saveTokens(next);
      return next.accessToken;
    } catch (error) {
      debug('AUTH', 'refresh network/error', { message: error instanceof Error ? error.message : String(error) });
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function api<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const auth = init.auth !== false;
  const method = init.method || 'GET';
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const headers: Record<string, string> = {
    accept: 'application/json',
    ...(init.body && !isFormData ? { 'content-type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> || {}),
  };
  let hadAccessToken = false;
  if (auth) {
    const tokens = await getTokens();
    hadAccessToken = !!tokens?.accessToken;
    if (tokens?.accessToken) headers.authorization = `Bearer ${tokens.accessToken}`;
  }

  const url = `${API_BASE_URL}${path}`;
  debug('API', '-->', { method, path, url, auth, hasAccessToken: hadAccessToken });

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (error) {
    debug('API', 'network failure', { method, path, message: error instanceof Error ? error.message : String(error) });
    throw new ApiError('NETWORK_ERROR', 'اتصال به سرور برقرار نشد. اینترنت گوشی را بررسی کنید.', 0);
  }

  debug('API', '<--', { method, path, status: response.status });

  if (auth && response.status === 401) {
    const access = await refreshAccessToken();
    if (access) {
      try {
        response = await fetch(url, { ...init, headers: { ...headers, authorization: `Bearer ${access}` } });
      } catch {
        throw new ApiError('NETWORK_ERROR', 'اتصال به سرور برقرار نشد. اینترنت گوشی را بررسی کنید.', 0);
      }
      debug('API', '<-- after refresh', { method, path, status: response.status });
    }
  }

  const envelope = await parseEnvelope<T>(response);
  if (!envelope.success) {
    throw new ApiError(
      envelope.error.code,
      resolveApiMessage(envelope.error, response.status),
      response.status,
      envelope.error.details,
    );
  }
  return envelope.data;
}

export async function login(mobile: string, password: string) {
  const data = await api<TokenPayload>(apiPaths.login, {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ mobile, password, device_id: await getDeviceId() }),
  });
  await saveTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessExpiresAt: data.access_expires_at,
    refreshExpiresAt: data.refresh_expires_at,
  });
  return data.user;
}

export async function signupRequestOtp(mobile: string, password: string) {
  return api<{ expires_in?: number; retry_after?: number; debug_code?: string }>(apiPaths.signupRequestOtp, {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ mobile, password }),
  });
}

export async function signup(mobile: string, password: string, code: string) {
  const data = await api<TokenPayload>(apiPaths.signup, {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ mobile, password, code, device_id: await getDeviceId() }),
  });
  await saveTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessExpiresAt: data.access_expires_at,
    refreshExpiresAt: data.refresh_expires_at,
  });
  return data.user;
}

export async function forgotRequestOtp(mobile: string, newPassword: string) {
  return api<{ expires_in?: number; retry_after?: number; debug_code?: string }>(apiPaths.passwordForgotRequestOtp, {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ mobile, new_password: newPassword }),
  });
}

export async function resetPassword(mobile: string, newPassword: string, code: string) {
  const data = await api<TokenPayload>(apiPaths.passwordReset, {
    auth: false,
    method: 'POST',
    body: JSON.stringify({ mobile, new_password: newPassword, code, device_id: await getDeviceId() }),
  });
  await saveTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessExpiresAt: data.access_expires_at,
    refreshExpiresAt: data.refresh_expires_at,
  });
  return data.user;
}

export async function logout() {
  await clearTokens();
}

export { apiPaths, notificationApiPaths };
