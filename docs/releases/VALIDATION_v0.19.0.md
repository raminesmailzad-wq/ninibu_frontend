# Validation — Ninibu Frontend v0.19.0

- TypeScript transpile/syntax validation passed for the new Admin Login component, Admin Shell changes, API proxy route, users panel, shared API paths and shared types.
- `/admin` and its admin components contain no signup, OTP registration, forgot-password or password-reset UI.
- Admin login is proxied server-side to `POST /api/v1/auth/admin/login` and uses the same secure httpOnly session cookies as the rest of the Web application.
- A full pnpm/Next build was not run in the artifact environment because project node_modules/pnpm are not installed there.
