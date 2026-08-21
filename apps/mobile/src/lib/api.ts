import { apiPaths, notificationApiPaths } from '@ninibu/api';
import type { ApiEnvelope, User } from '@ninibu/types';
import { API_BASE_URL, API_DEBUG } from './config';
import { clearTokens, getDeviceId, getTokens, saveTokens, type StoredTokens } from './storage';

type TokenPayload = { access_token: string; refresh_token: string; access_expires_at?: string; refresh_expires_at?: string; user?: User };
export class ApiError extends Error { constructor(public code: string, message: string, public status = 0, public details?: unknown) { super(message); } }

let refreshPromise: Promise<string | null> | null = null;

function debug(scope: string, message: string, meta?: Record<string, unknown>) {
  if (!API_DEBUG) return;
  if (meta) console.log(`[NINIBU:${scope}] ${message}`, meta);
  else console.log(`[NINIBU:${scope}] ${message}`);
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  if (response.status === 204) return { success: true, data: undefined as T };
  try { return await response.json() as ApiEnvelope<T>; }
  catch {
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
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken })
      });
      const envelope = await parseEnvelope<TokenPayload>(response);
      debug('AUTH', 'refresh response', {
        status: response.status,
        success: envelope.success,
        errorCode: envelope.success ? undefined : envelope.error.code
      });
      if (!envelope.success) {
        await clearTokens();
        return null;
      }
      const next: StoredTokens = {
        accessToken: envelope.data.access_token,
        refreshToken: envelope.data.refresh_token,
        accessExpiresAt: envelope.data.access_expires_at,
        refreshExpiresAt: envelope.data.refresh_expires_at
      };
      await saveTokens(next);
      debug('AUTH', 'refreshed tokens saved', {
        hasAccessToken: !!next.accessToken,
        hasRefreshToken: !!next.refreshToken
      });
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
  const headers: Record<string,string> = { 'content-type':'application/json', ...(init.headers as Record<string,string> || {}) };
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
    throw new ApiError('NETWORK_ERROR', `اتصال به سرور برقرار نشد. آدرس فعلی: ${API_BASE_URL}`);
  }
  debug('API', '<--', { method, path, status: response.status });

  if (auth && response.status === 401) {
    debug('AUTH', 'access token rejected; trying refresh', { path });
    const access = await refreshAccessToken();
    if (access) {
      response = await fetch(url, { ...init, headers: { ...headers, authorization: `Bearer ${access}` } });
      debug('API', '<-- after refresh', { method, path, status: response.status });
    }
  }

  const envelope = await parseEnvelope<T>(response);
  if (!envelope.success) {
    debug('API', 'request failed', {
      method,
      path,
      status: response.status,
      code: envelope.error.code,
      message: envelope.error.message
    });
    throw new ApiError(envelope.error.code, envelope.error.message || 'خطا در ارتباط با سرور', response.status, envelope.error.details);
  }
  debug('API', 'request succeeded', { method, path, status: response.status });
  return envelope.data;
}

export async function login(mobile: string, password: string) {
  debug('AUTH', 'password login start', { mobileSuffix: mobile.slice(-4), baseUrl: API_BASE_URL });
  const data = await api<TokenPayload>(apiPaths.login, {
    auth:false,
    method:'POST',
    body:JSON.stringify({ mobile, password, device_id: await getDeviceId() })
  });
  await saveTokens({
    accessToken:data.access_token,
    refreshToken:data.refresh_token,
    accessExpiresAt:data.access_expires_at,
    refreshExpiresAt:data.refresh_expires_at
  });
  debug('AUTH', 'login tokens saved', {
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
    hasUser: !!data.user
  });
  return data.user;
}

export async function signupRequestOtp(mobile:string, password:string) {
  return api<{expires_in?:number;retry_after?:number;debug_code?:string}>(apiPaths.signupRequestOtp,{auth:false,method:'POST',body:JSON.stringify({mobile,password})});
}
export async function signup(mobile:string, password:string, code:string) {
  const data=await api<TokenPayload>(apiPaths.signup,{auth:false,method:'POST',body:JSON.stringify({mobile,password,code,device_id:await getDeviceId()})});
  await saveTokens({accessToken:data.access_token,refreshToken:data.refresh_token,accessExpiresAt:data.access_expires_at,refreshExpiresAt:data.refresh_expires_at});
  debug('AUTH', 'signup tokens saved', { hasAccessToken: !!data.access_token, hasRefreshToken: !!data.refresh_token, hasUser: !!data.user });
  return data.user;
}
export async function forgotRequestOtp(mobile:string,newPassword:string) {
  return api<{expires_in?:number;retry_after?:number;debug_code?:string}>(apiPaths.passwordForgotRequestOtp,{auth:false,method:'POST',body:JSON.stringify({mobile,new_password:newPassword})});
}
export async function resetPassword(mobile:string,newPassword:string,code:string) {
  const data=await api<TokenPayload>(apiPaths.passwordReset,{auth:false,method:'POST',body:JSON.stringify({mobile,new_password:newPassword,code,device_id:await getDeviceId()})});
  await saveTokens({accessToken:data.access_token,refreshToken:data.refresh_token,accessExpiresAt:data.access_expires_at,refreshExpiresAt:data.refresh_expires_at});
  debug('AUTH', 'password reset tokens saved', { hasAccessToken: !!data.access_token, hasRefreshToken: !!data.refresh_token, hasUser: !!data.user });
  return data.user;
}
export async function logout() {
  debug('AUTH', 'local session cleared');
  await clearTokens();
}
export { apiPaths, notificationApiPaths };
