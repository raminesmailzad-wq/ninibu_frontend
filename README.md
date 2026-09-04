# Ninibu Frontend

Frontend monorepo for Ninibu. Web remains available alongside the native Expo/React Native parent app.

## v0.24.2 scope — Smart Booklet capture + DOB age hardening

- Keeps Smart Booklet Import on Web + native Expo Mobile and pairs with Backend v0.31.2.
- Native Mobile now opens a dedicated camera preview with a portrait document frame and explicit instruction to keep both phone and booklet vertical.
- Camera guidance requires a single complete page, all four page corners visible, minimal perspective and no glare.
- Gallery selection keeps the original image geometry (`allowsEditing=false`) instead of applying an arbitrary crop.
- Review rows use completed calendar months and derive the suggested measurement date from the child's stored birth date, with month-end clamping.
- Future/impossible ages and low-confidence extraction rows are filtered before review; weak rows are never auto-selected.
- Web applies the same DOB/month rules and shows portrait capture guidance.
- Mobile uses `expo-camera ~17.0.10` plus the existing `expo-image-picker`.
- Root, Web, Mobile and shared packages are `0.24.2`; Android versionCode/iOS buildNumber are `35`.
- Requires **Ninibu Backend v0.31.2** for the hardened `booklet-cv-v2` analyzer.

## v0.21.2 scope — Mobile user parity + Expo APK readiness

- Brings the normal-user mobile app to feature parity with the user-facing web panel across Home, child health, maternal health, community, discovery, services/consultations, shop, notifications and profile.
- Keeps maternal health as an independent bottom-tab route separate from child health and growth.
- Adds community profile/post/reaction/report flows, discovery knowledge/search/care-location flows, health timeline, booking management and consultation follow-up flows.
- Adds privacy-safe sponsored placements to Home, Community and Discover to match the web user experience.
- Prepares the mobile typography layer for licensed YekanBakh FaNum assets using expo-font.
- Removes small kicker/eyebrow labels above primary section titles.
- Adds parity, hook-order and font-family audits before Expo/typecheck.
- Expo SDK 54; Metro development port 8082; Android versionCode 25.
- APK preview profile is configured in apps/mobile/eas.json.


## v0.19.2 scope — Admin Control Center deployment patch

- Corrects Docker image/deployment versioning and local backend port defaults.
- Keeps the v0.18.0 Admin Control Center feature set unchanged.
- Adds a dedicated Web Backoffice under `/admin` for Admin/Super Admin accounts.
- Covers dashboard KPIs, knowledge content workflow, advertising, unified provider verification, community moderation, user access, commission reporting, feature flags, settings and audit history.
- `super_admin` is the only role allowed to change management roles and global System Settings; regular Admin keeps day-to-day operational access.
- Admin forms use centered viewport modals and never expose secret configuration in the browser.
- Administration remains intentionally Web-only; the parent mobile app is v0.24.2.
- Requires Ninibu Backend v0.26.1.

## v0.16.0 scope — Native Expo Mobile App

- Adds a real React Native / Expo application under `apps/mobile`; it is not a WebView.
- Reuses Ninibu API contracts, types, validation, design tokens and Jalali helpers from the monorepo.
- Supports password-first authentication, signup/recovery SMS verification, token refresh and SecureStore credential persistence.
- Includes onboarding, family/child switching, dashboard, health and WHO growth context, community, Discover/Search, services/bookings/consultations, commerce, notifications, profile and advertising consent.
- Mobile talks directly to the Go backend while the existing web app keeps its BFF + HttpOnly-cookie authentication model.
- Expo Go on a physical Android phone is the default development emulator; Android Studio is not required.
- Includes `eas.json` for later cloud APK builds without installing the Android toolchain locally.
- Existing web application behavior from v0.15.0 is retained.

## v0.15.0 scope — Password-first Authentication + SMS OTP

- Daily login now uses mobile + password without SMS.
- SMS OTP is reserved for first-time signup and password recovery.
- Existing OTP-only accounts are guided through password setup using the recovery flow.
- Signup/recovery validates the new password before requesting SMS to avoid unnecessary OTP cost.
- Frontend BFF stores access/refresh tokens in the existing HttpOnly cookies after login, signup, or reset.
- Requires Ninibu Backend v0.24.0.

## v0.14.0 scope — WHO Growth Intelligence

- Adds standard growth charts inside the child Health & Growth view using the enriched Backend v0.23.0 `growth-chart` contract.
- Compares the child trend against WHO reference curves at -3 SD, -2 SD, median, +2 SD and +3 SD.
- Shows weight-for-age, length/height-for-age, BMI-for-age and head-circumference-for-age when the WHO reference supports the child age.
- Shows the latest Z-score and approximate percentile without turning the reference position into a diagnosis.
- Retains the existing raw measurement cards and history; the standards chart is an additional interpretation layer.
- All measurement dates remain Jalali/Persian in the frontend; the backend still receives/stores Gregorian date-only values and ISO timestamps.
- Existing approved dashboard visuals, logo, centered Modal stack, nested Jalali Date Picker, routing and privacy-safe analytics are preserved.
- Requires Ninibu Backend v0.24.0 for WHO indicators; the component degrades gracefully if the older raw-only growth contract is returned.

## v0.13.0 scope — Targeted Advertising + Commerce / Marketplace

- Completes the planned v0.12 advertising phase with explicit sponsored UI, privacy-safe delivery/events and user-controlled ad preferences.
- Sponsored placements are limited to safe public surfaces; private child health, medication, allergy, diagnosis and private consultation views contain no ad slot.
- Adds the v0.13 store section with public products, variants, cart, checkout preview, orders, cancellation and payment hand-off.
- Final checkout collects the backend-required customer/shipping snapshot inside the standard centered Modal without sending those fields to Analytics.
- Store routes are first-class URLs (`/shop`, product, cart, checkout and order routes) so browser navigation and analytics funnels remain observable.
- Commerce analytics records coarse product/cart/order funnel events without child-health context or free-text payloads.
- Existing approved dashboard visuals, logo, centered Modal stack, nested Jalali Date Picker and Gregorian/ISO backend boundary are preserved.

## v0.11.0 scope — Action Center & Resumable Journeys

- Dashboard Action Center for unfinished bookings, upcoming confirmed bookings, consultations waiting for parent input, unread notifications and near-term vaccination follow-up.
- Booking drafts survive modal close for up to seven days in session storage and can be explicitly dismissed by the parent.
- Stable detail routes for bookings and consultations so resume/deep-link/back/refresh behavior is predictable.
- Privacy-safe analytics for continuation actions without free text, child identifiers, selected booking dates/times or health values.
- Existing approved dashboard visuals, centered Modal stack, Jalali Date Picker and Gregorian/ISO backend boundary remain unchanged.
- No backend/API contract change.

## v0.10.0 scope — UX Analytics & Funnel Observability

- Privacy-safe session analytics with sequence numbers and a bounded session-local event buffer.
- Page-view and page-exit events with visible engagement time instead of raw tab-open duration.
- Persistent funnel lifecycle primitives: start, resume, advance, abandon, interrupt and complete.
- Booking funnel abandonment is detected when the user closes the booking modal or navigates away from the booking route.
- Quick health entry flows (growth, vaccination, visit) now emit open/save/abandon funnel signals.
- Community, Discover/Search, Care discovery, Services and Profile actions emit coarse product events without free text, health values, child identifiers, search queries, dates or coordinates.
- Failed collector deliveries are buffered for the current session and retried when a collector is configured.
- Existing route architecture, approved dashboard visuals, centered modals and Jalali Date Picker behavior are preserved.
- No backend/API contract change.

## v0.8.0 scope — Dashboard Clarity & Visual Refresh

- Higher contrast authenticated dashboard without changing the Ninibu logo.
- Deeper existing lavender/pink neutrals, clearer borders and card separation.
- Improved quick-action and dashboard-card visibility.
- Dashboard discovery shortcuts now navigate to their real product surfaces.
- Existing centered modal and nested Jalali Date Picker standard is preserved.
- No backend/API contract change.

## v0.7.0 scope — Profile & Family Management

- Editable parent profile (name, birth date, gender).
- Editable residence with dependent country/province/city selectors.
- Family overview and active-child switching.
- Add-child flow from Profile using the existing children API.
- Centered form modals and nested Jalali Date Picker standard are preserved.
- Frontend dates remain Jalali/Persian while API date-only values remain Gregorian `YYYY-MM-DD`.

## v0.6.0 scope — Notification Center & Preferences

This release turns the existing notification badge into a complete in-app notification experience without changing the backend API contract.

Implemented:

- Notification Center drawer from the application header.
- All/unread filters with backend pagination.
- Mark one notification as read and mark all as read.
- Notification category and priority labels in Persian.
- Jalali/Persian rendering for notification timestamps, including relative time.
- Defensive handling for Go zero timestamps such as `0001-01-01T00:00:00Z`.
- Notification preference management by category.
- In-app opt-in/out controls for health, community, consultation, advertising, commerce and other backend categories.
- Quiet-hours editor with Persian digits in the UI and ASCII `HH:MM` values at the backend boundary.
- Existing advertising and commerce notification opt-ins remain explicit and separate from health data.
- Responsive notification drawer for desktop and mobile.

## Date and time policy

All user-visible calendar dates and date inputs use the Persian/Jalali calendar with Persian digits.

Frontend presentation/input examples:

```text
۲۱ مرداد ۱۴۰۵
۱۴۰۵/۰۵/۲۱
۲۲:۰۰
```

Backend payload/persistence examples:

```text
2026-08-12
2026-08-12T09:30:00Z
22:00
```

Date-only values are converted to Gregorian `YYYY-MM-DD` before the API boundary. Backend timestamps remain ISO instants and are converted only for display. Quiet-hour values are displayed with Persian digits but normalized to ASCII `HH:MM` before being sent to the backend.

See `docs/JALALI_DATE_POLICY.md`.

## Stack

- Next.js App Router + React + TypeScript (web)
- Expo + React Native + Expo Router (mobile)
- Tailwind CSS v4
- shadcn/ui-style open component conventions
- Zod
- TanStack Query
- Lucide React
- pnpm workspaces + Turborepo

Shared packages used by both web and the Expo/React Native client:

- `@ninibu/api`
- `@ninibu/types`
- `@ninibu/design`
- `@ninibu/validation`
- `@ninibu/datetime`

## Local run

Requirements: Node.js 22+, Corepack/pnpm, and Ninibu Backend v0.26.1 running locally.

```bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```

Default backend URL:

```env
NINIBU_BACKEND_URL=http://localhost:8081
```

### Run the native mobile app on your Android phone

```bash
pnpm install --no-frozen-lockfile --prefer-offline
pnpm mobile:prepare-font
pnpm --filter @ninibu/mobile typecheck
pnpm dev:mobile:lan
```

Scan the QR code in Expo Go. Mobile defaults to the production HTTPS API (`https://ninibu.com`). For a local development backend, copy `apps/mobile/.env.example` to `apps/mobile/.env` and set `EXPO_PUBLIC_NINIBU_BACKEND_URL` to an address reachable by the phone. See `apps/mobile/README.md`.

Suggested smoke flow:

```text
Login
→ Home
→ open notification bell
→ switch all/unread
→ mark one notification read
→ mark all read
→ open notification settings
→ edit quiet hours using Persian digits
→ save
→ verify backend receives ASCII HH:MM
→ open any health/date form and verify Jalali input remains enforced
```

## Validation

Packaging-time checks and environment limitations are documented in `VALIDATION.md`.


## Route & analytics architecture (v0.9.0)
Main product areas now use real Next.js routes instead of dashboard-only state. Booking funnel stages also have stable routes so refresh, deep links, browser history and funnel analysis work predictably. Analytics call sites emit only generic product/navigation metadata; sensitive health/profile content is intentionally excluded. A collector can be connected later through `NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT` without changing feature components.


## Mobile care map (v0.23.4)

The native app uses OpenStreetMap + Leaflet inside `react-native-webview`; Google Maps API keys are no longer required. Override tiles with `EXPO_PUBLIC_NINIBU_MAP_TILE_URL` when moving beyond light test traffic.
