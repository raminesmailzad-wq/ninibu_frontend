# Ninibu Frontend v0.24.3 — Release Manifest

## Compatibility

- Required backend: **v0.31.3**
- Web: Next.js 16 / React 19
- Mobile: Expo SDK 54 / React Native 0.81
- Android package: `com.ninibu.app`
- Android versionCode: `40`
- App version: `0.24.3`

## User-facing changes

- Mobile form modals stay scrollable while the keyboard is open; focusing a shared form field scrolls it into the visible keyboard-safe area.
- Jalali date fields on Mobile are selection-only: year, month and valid day are chosen from pickers instead of typed with the numeric keyboard.
- Creating a child is optional during onboarding. Users may finish setup before birth or before they are ready to create a child profile.
- Without a child, maternal health, community, discovery/content, general services/consultations, shop and account features remain available.
- Child-scoped health features show a disabled/gated state with an Add Child action until a child exists.
- Web mirrors the optional-child behavior; discovery falls back to general content and service/consultation attachment to a child is optional.

## Validation

- `pnpm verify` passed: TypeScript, ESLint, tests and Next.js production build (68/68 static pages).
- API package: 8 tests passed.
- Datetime package: 8 tests passed.
- Web package: 6 tests passed.
- `pnpm mobile:apk-check` passed for version `0.24.3`, Android versionCode `40`.
- Font audit reports only the existing safe Medium-to-Regular fallback for YekanBakh FaNum.
