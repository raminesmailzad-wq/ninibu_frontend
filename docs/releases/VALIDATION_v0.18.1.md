# Validation — Ninibu Frontend v0.18.1

- Root and Web package versions are aligned to v0.18.1.
- Mobile remains v0.17.0 intentionally.
- Frontend Compose defaults to `ninibu-frontend:0.18.1`.
- Frontend deployment documentation targets Backend v0.26.1.
- Frontend has no direct MySQL dependency; server-side requests continue to use `http://api:8081` over the shared Docker network.
- Docker Compose YAML parses successfully.

A full Next.js build requires the workspace dependencies (`pnpm install --frozen-lockfile`), which are not present in the packaging runtime.
- Web local backend fallback and `.env.example` now use port `8081`, matching the backend default.
- Expo `app.json`, mobile package metadata and runtime `APP_VERSION` are aligned to mobile v0.17.0.
- Private shared workspace package metadata is aligned to the current v0.18.1 frontend release.

A direct `tsc` attempt was also made. It reached project sources but cannot resolve `next/server` and workspace packages because `node_modules` is absent; no claim of a successful full typecheck/build is made from this environment.
