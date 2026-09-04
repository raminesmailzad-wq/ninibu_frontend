# Ninibu Frontend v0.24.0 release manifest

- Baseline: v0.23.4 OSM/GPS performance-marker release.
- Backend contract: Ninibu Backend v0.31.0.
- Root package: `0.24.0`.
- Web package: `0.24.0`.
- Mobile package/Expo version: `0.24.0`.
- Shared packages (`api`, `types`, `validation`, `design`, `datetime`): `0.24.0`.
- Android versionCode: `33`.
- iOS buildNumber: `33`.
- New Web component: `apps/web/components/health/booklet-import-modal.tsx`.
- New Web BFF routes: `apps/web/app/api/ninibu/children/[childId]/document-imports/**`.
- New Mobile component: `apps/mobile/src/components/BookletImportModal.tsx`.
- Mobile dependency: `expo-image-picker ~17.0.11` (Expo SDK 54 family).
- Existing Web/Admin design, OSM map, history/navigation behavior and nested Jalali modal behavior are retained.
- No Admin Smart Booklet flow is added; the feature belongs to the parent child-health surface.
- No `pnpm-lock.yaml` was present in the supplied baseline archive; regenerate and commit it in a network-enabled repository environment.
