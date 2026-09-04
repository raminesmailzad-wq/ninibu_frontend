# Validation — Ninibu Frontend v0.24.0

Validated in the packaging environment on 2026-09-04.

## Smart Booklet Import checks

- Web integration is present in `HealthDashboard` and opens a centered `ModalPortal`; the nested Jalali Date Picker remains a second modal layer.
- Mobile integration is present in the Health/Growth tab and uses the existing centered `FormModal` + `JalaliDateModalInput` flow.
- Shared `@ninibu/api` includes analyze/get/confirm document-import paths.
- Shared `@ninibu/types` includes `DocumentImport`, item/page types, confirm response and growth provenance fields.
- Web BFF and browser API helper detect `FormData` and do not set JSON content-type on multipart requests.
- Mobile API helper detects `FormData` and lets React Native generate the multipart boundary.
- Mobile Expo config includes `expo-image-picker` camera/photos permission descriptions.
- Root/Web/Mobile/shared package versions are `0.24.0`; Expo version is `0.24.0`, Android versionCode `33`, iOS buildNumber `33`.
- TypeScript/TSX sources were parsed with the locally available TypeScript compiler API; syntax diagnostics are zero.
- All JSON manifests parse successfully.
- Full dependency-aware `pnpm typecheck/build` cannot run in this packaging environment because the release ZIP has no `node_modules`/`pnpm-lock.yaml` and outbound npm registry access is blocked. Run `pnpm install --no-frozen-lockfile` once in the repository environment, commit the generated lockfile, then run `pnpm typecheck && pnpm build`.

## Backend contract

Smart Booklet Import requires Backend v0.31.0. The first MVP supports weight-for-age (first-year template panel), height-for-age and head-circumference-for-age. Weight-for-height and vaccination/screening handwriting are intentionally not exposed as import options yet.

---

## Historical validation notes

# Validation — Ninibu Frontend v0.23.4

Validated in the packaging environment:

- MapLibre GL JS v6 integration uses ESM named exports (`Map`, `Marker`, `LngLatBounds`, `NavigationControl`, `AttributionControl`) instead of the removed default export.
- TypeScript/TSX sources were parsed with the TypeScript compiler parser with no syntax diagnostics after the patch.
- Root, Web and Mobile package versions are 0.23.2; shared private workspace packages are aligned to 0.23.2.
- Expo app version is 0.23.2 with Android versionCode 29 and iOS buildNumber 29.
- Admin surface: `/admin`; public Website: `apps/web`; native App: `apps/mobile`.
- Admin CMS, Media Library/upload, Rich Text Editor and Care Location Map CRUD files are included.
- Full dependency-aware `pnpm build` cannot be executed in this packaging environment because npm registry DNS/network access is unavailable. The reported MapLibre v6 Turbopack failure was reproduced from source semantics and fixed against the official v6 ESM API.

## v0.23.2 production-build fixes

- Fixed `components/admin/care-locations-panel.tsx`: blank form no longer references out-of-scope `x`.
- Fixed `components/discovery/care-map.tsx`: single-point map centering now guards the indexed item for strict TypeScript (`noUncheckedIndexedAccess`).
- All TypeScript/TSX source files parse successfully with TypeScript 5.8.3.
- JSON manifests parse successfully.
- Full dependency-aware `next build` could not be repeated in the packaging environment because npm registry DNS/network access is unavailable. The two exact TypeScript errors reported by production build were patched directly.

## v0.23.4 mobile map validation

- `react-native-maps` is removed from Mobile dependencies and source imports.
- Mobile care map uses `react-native-webview` + OpenStreetMap/Leaflet and retains marker selection, current-location behavior and OSM attribution.
- Google Maps API-key injection is removed from `apps/mobile/app.config.js`.
- Mobile parity/readiness audits now reject accidental reintroduction of `react-native-maps`.
- The uploaded v0.23.2 archive did not contain `pnpm-lock.yaml`; regenerate the existing repository lockfile once with `pnpm install --no-frozen-lockfile` after applying this version.

## v0.23.4 mobile care-map validation

- Hook-order audit: passed.
- Web/mobile parity audit: passed (14 groups).
- Shared YekanBakh FaNum typography audit: passed.
- TypeScript syntax transpilation: 33 mobile TS/TSX files, 0 syntax errors.
- Embedded Leaflet JavaScript: `node --check` passed after resolving runtime template values.
- `react-native-maps` source imports: none.
- Version/EAS metadata: v0.23.4, Android versionCode 32, owner/projectId preserved.
- Full `tsc --noEmit` is expected to run on the user's repository via `pnpm --filter @ninibu/mobile typecheck`, because the uploaded release ZIP intentionally does not contain `node_modules` or the user's licensed font binaries.
