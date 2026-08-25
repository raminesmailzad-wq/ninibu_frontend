# Ninibu Mobile v0.21.3 — YekanBakh FaNum Medium fallback

This patch removes the unnecessary hard requirement for `YekanBakhFaNum-Medium.ttf`.

APK-required licensed assets:
- `apps/mobile/assets/fonts/YekanBakhFaNum-Regular.ttf`
- `apps/mobile/assets/fonts/YekanBakhFaNum-Bold.ttf`

Optional:
- `apps/mobile/assets/fonts/YekanBakhFaNum-Medium.ttf`

When Medium is absent, `typography.medium` resolves to the Regular YekanBakh FaNum family. This avoids an APK-readiness failure while keeping YekanBakh FaNum and Persian numerals active.

`pnpm mobile:apk-check` now runs the complete mobile TypeScript typecheck first, then APK readiness checks.
