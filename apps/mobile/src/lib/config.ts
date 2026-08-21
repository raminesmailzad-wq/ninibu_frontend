function normalizeBase(value?: string) {
  return value?.trim().replace(/\/$/, '') || '';
}

const explicit = normalizeBase(process.env.EXPO_PUBLIC_NINIBU_BACKEND_URL);

// Production is the safe/default mobile backend. Override with .env for local development.
export const API_BASE_URL = explicit || 'https://ninibu.com';
export const APP_VERSION = '0.16.1';
export const API_DEBUG = __DEV__;
