# Ninibu Frontend v0.23.2 — MapLibre v6 Build Fix

## Fixed
- Replaced the removed `maplibre-gl` default import with MapLibre GL JS v6 ESM named imports.
- Updated Care Map construction, marker creation, bounds and controls to the v6 API.
- This addresses the Next.js 16 / Turbopack production build error: `Export default doesn't exist in target module`.

## Versioning
- Web/root/shared packages: 0.23.2
- Expo app: 0.23.2
- Android versionCode: 29
- iOS buildNumber: 29
- Backend compatibility: v0.29.0

### Build fix v0.23.2
- Fixed strict TypeScript failure in the Admin Care Locations default form (`x` out of scope).
- Fixed strict TypeScript failure when centering MapLibre on a single result with `noUncheckedIndexedAccess` enabled.
