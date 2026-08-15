# Ninibu Frontend v0.6.3

## Jalali Date Picker restoration

- Restored a clickable date picker for every date field that uses `JalaliDateInput`.
- Calendar UI is fully Persian/Jalali: Persian month names, Persian digits, Saturday-first week and Jalali month navigation.
- Users may either select a date from the calendar or type a Jalali date manually.
- Form state and API payloads remain Gregorian `YYYY-MM-DD`; the conversion happens inside the front-end date component.
- No backend/API contract changes.
- No new date-picker dependency was added, so the fix does not introduce another workspace/module-resolution risk.
