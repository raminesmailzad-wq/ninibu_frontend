import * as SecureStore from 'expo-secure-store';

const ACCESS = 'ninibu_access';
const REFRESH = 'ninibu_refresh';
const DEVICE = 'ninibu_device_id';
const CHILD = 'ninibu_selected_child';

export type StoredTokens = { accessToken: string; refreshToken: string; accessExpiresAt?: string; refreshExpiresAt?: string };

export async function getTokens(): Promise<StoredTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([SecureStore.getItemAsync(ACCESS), SecureStore.getItemAsync(REFRESH)]);
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}
export async function saveTokens(tokens: StoredTokens) {
  await Promise.all([SecureStore.setItemAsync(ACCESS, tokens.accessToken), SecureStore.setItemAsync(REFRESH, tokens.refreshToken)]);
}
export async function clearTokens() { await Promise.all([SecureStore.deleteItemAsync(ACCESS), SecureStore.deleteItemAsync(REFRESH)]); }
export async function getDeviceId() {
  const existing = await SecureStore.getItemAsync(DEVICE); if (existing) return existing;
  const id = `rn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  await SecureStore.setItemAsync(DEVICE, id); return id;
}
export async function getSelectedChildId() { const value = await SecureStore.getItemAsync(CHILD); return value ? Number(value) : null; }
export async function setSelectedChildId(id: number) { await SecureStore.setItemAsync(CHILD, String(id)); }
