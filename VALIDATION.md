# Validation — Ninibu Frontend v0.23.1

Validated in the packaging environment:

- MapLibre GL JS v6 integration uses ESM named exports (`Map`, `Marker`, `LngLatBounds`, `NavigationControl`, `AttributionControl`) instead of the removed default export.
- TypeScript/TSX sources were parsed with the TypeScript compiler parser with no syntax diagnostics after the patch.
- Root, Web and Mobile package versions are 0.23.1; shared private workspace packages are aligned to 0.23.1.
- Expo app version is 0.23.1 with Android versionCode 29 and iOS buildNumber 29.
- Admin surface: `/admin`; public Website: `apps/web`; native App: `apps/mobile`.
- Admin CMS, Media Library/upload, Rich Text Editor and Care Location Map CRUD files are included.
- Full dependency-aware `pnpm build` cannot be executed in this packaging environment because npm registry DNS/network access is unavailable. The reported MapLibre v6 Turbopack failure was reproduced from source semantics and fixed against the official v6 ESM API.
