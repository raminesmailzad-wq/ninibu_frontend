# Ninibu Frontend v0.19.0

- Dedicated `/admin` login-only flow.
- No signup, OTP registration or password reset controls are rendered under `/admin`.
- Admin authentication uses `POST /api/v1/auth/admin/login`; credentials are managed by backend server environment configuration.
