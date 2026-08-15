# Validation — Ninibu Frontend v0.14.0

## Scope

WHO Growth Intelligence UI on top of the complete v0.13.0 frontend.

## Checks performed

- Parsed/transpiled 172 TypeScript/TSX source files with TypeScript 5.8.3: zero syntax diagnostics.
- Jalali date policy audit passes.
- No native `type="date"` or `datetime-local` control is present in app TypeScript/TSX sources.
- `apps/web` has no runtime import of `@ninibu/datetime`; date UI remains on the stable local datetime boundary.
- Growth chart keeps legacy raw measurement cards and adds WHO indicators through the existing `growth-chart` route.
- Chart dates are rendered through the centralized Jalali formatter.
- Chart is responsive and does not require horizontal scrolling.
- Missing WHO indicators / unspecified gender degrade to an explanatory empty state instead of breaking health records.
- Root and web package versions are `0.14.0`.
- Ninibu logo SHA256 remains `51fc51093e4b555899890b230a26e206110a5b9ddf5df74ee5f01f5f5e36abf8`.

## Build note

The packaging environment does not contain the release dependency store (`node_modules` is intentionally excluded), so this report does not claim a full dependency-resolving Next.js build/lint/project-wide semantic typecheck. Syntax-level TypeScript parsing, route/API boundary inspection, date-policy audit and archive integrity are verified.
