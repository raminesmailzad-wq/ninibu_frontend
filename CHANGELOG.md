# Changelog

## 0.4.0 — 2026-08-10

### Added
- Full Services hub replacing the previous Services placeholder.
- Public commerce service catalog with search/category filter and service cards.
- Live booking availability, date/slot selection and child-aware booking.
- Free-service booking and paid-service payment initialization.
- Sandbox payment success/failure controls for local development when provider is `sandbox`.
- Booking history, detail, meeting link, cancellation and rescheduling.
- Parent consultation UI with private/public/anonymous-public modes.
- Consultation categories, question composer, own/public lists and question detail.
- Official specialist answer badge, answer acceptance and follow-up messages.
- Consultation close/reopen lifecycle and rule-based backend suggestions.
- Shared TypeScript contracts for consultation, commerce services, booking and payment.
- Shared API path builders and Next.js BFF routes for all flows used in this release.
- Helper tests for booking de-duplication and API paths.

### Changed
- Workspace package versions updated to 0.4.0.
- Services item in desktop/mobile navigation now opens the real Services/Booking/Consultation surface.

### Compatibility
- Backend v0.22.2 has a duplicate append in `modules/booking/service.go` `ListBookings`; the frontend defensively de-duplicates identical booking IDs so the UI does not show duplicates. This is a backend bugfix candidate and not a change to booking semantics.

### Privacy / Safety
- Booking child association does not imply clinician health-record consent.
- Consultation is kept separate from the private health record.
- Public consultation only uses backend-permitted answered/closed questions.
- System suggestions are labeled as general guidance and not diagnosis/prescription.
- Browser auth tokens remain in HttpOnly BFF cookies.

## 0.3.2
- Fixed React 19/ESLint strict lint failures in AppFrame.
- Stabilized child collection memoization and removed synchronous setState from effects.
- Renamed ChildSwitcher `children` prop to `items` to follow React conventions.
- Replaced raw logo `<img>` with Next.js `<Image>`.
- Stabilized Community group list memoization.
- Named PostCSS config export.

## 0.3.1
- Fixed TypeScript strictness issues in active-child selection and Community composer.

## 0.3.0
- Added full Community & Parent Groups product surface.
