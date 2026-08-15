# Jalali Date Policy — Frontend v0.6.0

## Rule

Ninibu has one explicit date boundary:

- **Frontend display:** Persian/Jalali calendar with Persian digits.
- **Frontend date forms:** users type/select Jalali dates with Persian digits.
- **Application/API state:** valid date-only values are Gregorian `YYYY-MM-DD`.
- **Backend persistence:** Gregorian dates and ISO timestamps; no Jalali strings are stored.

Example:

```text
User sees/types: ۱۴۰۵/۰۵/۲۱
Frontend sends:  2026-08-12
Backend stores:  2026-08-12
Frontend reads:  ۲۱ مرداد ۱۴۰۵
```

For instants/date-times, the backend remains authoritative for timezone/ISO semantics. The frontend changes only the rendered calendar and digits.

## Shared implementation

All date conversion/formatting is centralized in `packages/datetime` (`@ninibu/datetime`). Frontend components must not create their own Persian calendar formatters.

Use:

- `formatJalaliDate`
- `formatJalaliShortDate`
- `formatJalaliDay`
- `formatJalaliDateTime`
- `formatPersianTime`
- `formatRelativeFa`
- `gregorianToJalaliInput`
- `jalaliInputToGregorian`
- `todayGregorianDate`

For date-only forms, use `apps/web/components/ui/jalali-date-input.tsx`. Its controlled value is Gregorian even though the visible value is Jalali.

## Release gates

Before release:

1. No native HTML `type="date"` or `type="datetime-local"` may remain in frontend source.
2. No direct `Intl.DateTimeFormat` may exist outside `@ninibu/datetime`.
3. Known conversion boundaries must be tested, including Nowruz.
4. Network payload smoke tests must confirm date-only fields are Gregorian.
5. Backend schema/storage must not be changed merely to support Jalali presentation.

## Empty/zero dates

Invalid dates and Go zero timestamps such as `0001-01-01T00:00:00Z` are rendered as an empty/placeholder value rather than as a misleading historical date.

## v0.6.0 — Notification and time-only boundary

- Notification ISO timestamps (`created_at`, `scheduled_at`, `sent_at`, `delivered_at`, `read_at`, `updated_at`) must pass `isBackendDateTimePresent` before presentation and must be formatted with shared Jalali helpers.
- `0001-01-01T00:00:00Z` is a backend zero value and is not user-visible.
- Quiet-hours inputs display Persian digits; payload values are normalized with `normalizeBackendClock` and validated by `isValidBackendClock` as ASCII `HH:MM`.
- Run `pnpm audit:dates` as the release guard against native date controls and ad-hoc date formatting.
