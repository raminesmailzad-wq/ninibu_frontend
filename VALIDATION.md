# Validation — Ninibu Frontend v0.24.2

Validated in the packaging environment on 2026-09-04.

## Smart Booklet capture / DOB-age hardening

- Native Mobile includes a dedicated `expo-camera` full-screen capture component with a portrait page frame and four-corner visual guide.
- The capture copy explicitly requires phone vertical + booklet vertical, one complete page, minimal perspective, and no glare.
- Gallery import uses `allowsEditing=false` so the OS picker does not distort/crop the chart template.
- Mobile and Web derive suggested dates with shared `addCalendarMonthsDateOnly(child.birth_date, age_month)`, not fractional average-day offsets.
- `completedAgeMonths` filters points beyond the child's current completed calendar age.
- Client review filters confidence below 0.55; only >=0.72 without a warning is auto-selected.
- `DOCUMENT_SCAN_LOW_CONFIDENCE` is localized on Web and Mobile.
- Root/Web/Mobile/shared versions are `0.24.2`; Expo version `0.24.2`; Android versionCode `35`; iOS buildNumber `35`.
- `expo-camera` is pinned to `~17.0.10`, the Expo SDK 54 recommended line.
- Updated `mobile-apk-readiness.mjs` checks both `expo-camera` and `expo-image-picker`.

## Static checks

- Changed TS/TSX sources parse with zero TypeScript syntax diagnostics using the locally available compiler.
- `packages/datetime/src/index.ts` passes standalone strict TypeScript checking.
- All JSON manifests parse successfully.
- Dependency-aware `pnpm typecheck` / `next build` cannot run in this packaging environment because registry access is blocked and the supplied baseline has no lockfile/node_modules. Run `pnpm install --no-frozen-lockfile`, then `pnpm typecheck && pnpm build` in the repository environment.

## Backend pairing

Use Backend v0.31.2. Its `booklet-cv-v2` returns whole calendar-month ages, DOB-anchored non-future dates, stricter WHO plausibility filtering and `DOCUMENT_SCAN_LOW_CONFIDENCE` when no reliable candidate remains.

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
