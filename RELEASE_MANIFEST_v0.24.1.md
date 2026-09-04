# Ninibu Frontend v0.24.1 release manifest

- Baseline: v0.24.0 Smart Booklet Import hotfix.
- Backend contract: Ninibu Backend v0.31.1.
- Root package: `0.24.1`.
- Web package: `0.24.1`.
- Mobile package/Expo version: `0.24.1`.
- Shared packages (`api`, `types`, `validation`, `design`, `datetime`): `0.24.1`.
- Android versionCode: `34`.
- iOS buildNumber: `34`.
- New native camera component: `apps/mobile/src/components/BookletCameraModal.tsx`.
- Mobile dependencies: `expo-camera ~17.0.10`, `expo-image-picker ~17.0.11`.
- Mobile Smart Booklet capture: portrait-only UX guidance, live page frame, single-page/corner/glare/perspective instructions.
- Smart Booklet review: DOB + integer calendar month derived suggested dates; low-confidence and impossible-age filtering; conservative auto-accept threshold.
- Web Smart Booklet review uses the same DOB/calendar-month logic and portrait photo guidance.
- Shared `@ninibu/datetime` adds `addCalendarMonthsDateOnly` and `completedAgeMonths`.
- Existing Web/Admin design, OSM map, history/navigation behavior and nested Jalali modal behavior are retained.
- No Admin Smart Booklet flow is added; the feature belongs to the parent child-health surface.
- No `pnpm-lock.yaml` was present in the supplied baseline archive; regenerate and commit it in a network-enabled repository environment.

- Native booklet camera guide: گوشی عمودی، صفحه کامل دفترچه داخل کادر، عنوان آبی نمودار سمت راست کادر؛ gallery images may already be rotated because backend orientation normalization is rotation-aware.
