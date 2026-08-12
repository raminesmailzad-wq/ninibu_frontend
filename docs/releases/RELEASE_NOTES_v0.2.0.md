# Ninibu Frontend v0.2.0 — App Shell & Child Health Dashboard

Release date: 2026-08-09
Backend contract target: Ninibu Backend v0.22.2

## Purpose

Turn the initial authentication/onboarding vertical slice into the first usable signed-in Ninibu experience. The release deliberately focuses on the product's main pillar: the parent's child dashboard, growth information and private health record summary.

## Functional scope

- Responsive app shell with desktop sidebar and mobile bottom navigation.
- Active child selection, persisted locally by child ID only.
- Home dashboard with real backend data.
- Latest growth metrics.
- Vaccine, allergy, medication and medical-visit summaries.
- Health page with record counts, active records and unified health timeline.
- Explainable recommendation cards.
- Quick actions: growth measurement, vaccination and medical visit.
- Profile card using residence city from Backend v0.22.2.
- Placeholder navigation surfaces for Community and Services without fake data.

## API additions in the Next BFF

Authenticated proxy routes were added for child growth measurements/chart, vaccinations, allergies, medications, medical visits, health timeline, recommendations and notification unread count.

## Compatibility

This frontend release expects Backend v0.22.2. It preserves the v0.1.0 login/onboarding contract and extends it without changing the backend.

## Upgrade from v0.1.0

Replace the v0.1.0 source with this release, keep the same `NINIBU_BACKEND_URL`, reinstall dependencies if needed, then run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` on a machine with npm registry access.
