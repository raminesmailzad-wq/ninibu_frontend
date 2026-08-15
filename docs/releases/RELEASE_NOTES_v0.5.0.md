# Ninibu Frontend v0.5.0

Release date: 2026-08-12

## Product scope

v0.5.0 introduces **Discover** as a first-class product surface. It combines personalized recommendations, the public Knowledge Base, unified public search, and verified healthcare-directory discovery.

## Main user journeys

- Open Discover → view explainable recommendations → mark useful/not interested.
- Browse Knowledge → filter → open detail → read disclaimers/sources/FAQ → bookmark or give feedback.
- Search across public Ninibu entities → use suggestions/trends/history → open result.
- Find verified care locations by residence city or explicitly request one-time nearby lookup.
- Enter onboarding and health dates in Persian/Jalali while backend requests remain Gregorian.

## Date migration

The release adds `@ninibu/datetime` and migrates user-facing date rendering and date-only forms to the common policy described in `docs/JALALI_DATE_POLICY.md`.

## Privacy notes

Precise browser geolocation is requested only through an explicit user action and is kept in transient component state. It is not written to local storage or profile data by this frontend. Discover/search do not send private health-record fields to ranking or advertising surfaces.
