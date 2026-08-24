# Validation — Ninibu Frontend v0.19.2

- Route wiring checked for `/dashboard`, `/health`, and `/maternal-health`.
- Maternal health is no longer rendered inside child health.
- Desktop/mobile navigation includes the maternal route.
- API/client/login/admin-login/onboarding error paths normalize user-facing messages to Persian.
- Docker build is the authoritative release validation.

## Release check notes

- TypeScript/TSX syntax transpilation passed for all changed files using TypeScript 5.8.3.
- A full pnpm/Next production build could not be executed in this workspace because package-registry access is blocked; production Docker build remains the authoritative build check.
