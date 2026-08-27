import Constants from 'expo-constants';

function normalizeBase(value?: string) {
  return value?.trim().replace(/\/$/, '') || '';
}

const explicit = normalizeBase(process.env.EXPO_PUBLIC_NINIBU_BACKEND_URL);

// The physical-phone Expo build talks to the public HTTPS reverse proxy by default.
// Override only when the phone can actually reach a local development address.
export const API_BASE_URL = explicit || 'https://ninibu.com';
export const APP_VERSION = Constants.expoConfig?.version || '0.23.3';
export const METRO_DEV_PORT = 8082;
export const API_DEBUG = __DEV__;
