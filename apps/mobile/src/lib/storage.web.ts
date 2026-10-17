const ACCESS = 'ninibu_access';
const REFRESH = 'ninibu_refresh';
const DEVICE = 'ninibu_device_id';
const CHILD = 'ninibu_selected_child';

export type StoredTokens = { accessToken: string; refreshToken: string; accessExpiresAt?: string; refreshExpiresAt?: string };

function storage() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage; } catch { return null; }
}

export async function getTokens(): Promise<StoredTokens | null> {
  const s = storage();
  if (!s) return null;
  const accessToken = s.getItem(ACCESS);
  const refreshToken = s.getItem(REFRESH);
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export async function saveTokens(tokens: StoredTokens) {
  const s = storage();
  if (!s) return;
  s.setItem(ACCESS, tokens.accessToken);
  s.setItem(REFRESH, tokens.refreshToken);
}

export async function clearTokens() {
  const s = storage();
  if (!s) return;
  s.removeItem(ACCESS);
  s.removeItem(REFRESH);
}

export async function getDeviceId() {
  const s = storage();
  if (!s) return `pwa-${Date.now().toString(36)}`;
  const existing = s.getItem(DEVICE);
  if (existing) return existing;
  const id = `pwa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  s.setItem(DEVICE, id);
  return id;
}

export async function getSelectedChildId() {
  const value = storage()?.getItem(CHILD);
  return value ? Number(value) : null;
}

export async function setSelectedChildId(id: number) {
  storage()?.setItem(CHILD, String(id));
}
