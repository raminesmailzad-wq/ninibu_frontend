# Ninibu Frontend v0.16.1

This is a diagnostic/fix release for Expo mobile authentication.

## Changes
- Mobile production backend defaults to `https://ninibu.com`.
- Auth/API/session lifecycle logs are emitted to Metro only in development.
- Logs intentionally never print passwords, OTP values, access tokens, or refresh tokens.
- `/api/v1/auth/me` failures after login now propagate to the login screen instead of silently redirecting back.
- Expo Go splash-screen warning removed.

## Expected diagnostic sequence
A healthy login should show `login tokens saved`, `/auth/me` 200, then `/profile`.
If `/auth/me` returns 401, the client will log refresh attempt/status, allowing proxy/token issues to be isolated.
