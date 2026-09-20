# Ninibu Frontend Validation — v0.24.2

## Scope

Smart Booklet Import camera guidance and DOB/calendar-month accuracy hardening on both Web and Expo Mobile.

## Checks performed

- Parsed all 243 TypeScript/TSX source files with the TypeScript 5.9 parser: **0 syntax diagnostics**.
- `mobile-hooks-audit`: passed.
- `mobile-parity-audit`: passed all 14 user-access capability groups.
- `mobile-font-audit`: passed the shared typography-family policy.
- Shared DOB helpers were executed in isolation and verified for:
  - Jan 31 + 1 calendar month -> Feb 28/29 clamp.
  - completed-month boundary before/on the monthly anniversary.
  - child DOB + 6 months -> the corresponding calendar date.
- All JSON files in Backend + Frontend working trees parsed successfully (54 files at validation time).
- Version alignment checked: Root/Web/Mobile/shared packages `0.24.2`; Expo app `0.24.2`; Android versionCode `35`; iOS buildNumber `35`.
- `expo-camera` and `expo-image-picker` are present in Mobile package/config; camera permission copy is present.
- Docker default image tag aligned to `ninibu-frontend:0.24.2`.
- Smart Booklet Web and Mobile both consume the child DOB and apply whole-month, future-age and confidence review gates.

## Known baseline/environment limitations

- The supplied source baseline does not contain `pnpm-lock.yaml` or installed `node_modules`, and this packaging environment has no package-network access. A full dependency-aware `next build` / Expo `tsc` therefore cannot be executed here. Run `pnpm install --no-frozen-lockfile`, then `pnpm --filter @ninibu/web build` and `pnpm mobile:apk-check` in CI/deployment.
- `mobile-apk-readiness` also reports that the optional/private YekanBakh font binaries are not present in this artifact. No font binaries are added by this release.
- The pre-existing global date audit still reports `apps/web/components/admin/common.tsx` for direct `Intl.DateTimeFormat`; this file is unrelated to Smart Booklet changes.
