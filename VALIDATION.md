# Validation report — Ninibu Frontend v0.4.0

## Packaging validation performed

- Base release: Ninibu Frontend v0.3.2, which the developer workstation previously built successfully with Next.js and passed typecheck/lint/test/build.
- Parsed every TypeScript/TSX source file in `apps/` and `packages/` with TypeScript 5.8.3 `transpileModule`; 101 source files, zero syntax diagnostics.
- Compared every new backend-facing route against Backend v0.22.2 source routes/DTOs for consultation, commerce services, booking and payment.
- Confirmed paid booking flow uses the backend-generated `order_id`, then `/commerce/orders/:order_id/payments` with `Idempotency-Key`.
- Confirmed booking creation uses `Idempotency-Key` and child ID remains optional.
- Confirmed booking availability uses `/commerce/services/:service_id/available-slots` and backend date defaults when no range is supplied.
- Confirmed consultation privacy values match backend: `private`, `anonymous_public`, `public`.
- Confirmed public consultation questions are backend-filtered to answered/closed public records.
- Added a regression helper that de-duplicates booking IDs because Backend v0.22.2 currently appends each booking twice in `ListBookings`.
- Parsed all package JSON manifests.
- Release archive excludes `.env`, `.env.local`, `node_modules`, `.next`, caches and secrets.
- ZIP integrity and SHA256 checks are performed during packaging.

## Not claimed in packaging environment

The packaging environment cannot resolve `registry.npmjs.org`, so dependencies cannot be installed here. Therefore this report does **not** claim that the following ran for v0.4.0 in this environment:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run those four commands on the developer workstation before treating v0.4.0 as locally validated.

## Suggested smoke test

1. Run Backend v0.22.2 and Frontend v0.4.0.
2. Login with a user whose onboarding is complete and has at least one child.
3. Open Services and verify service list/search/category filter.
4. Open a scheduled service, choose a live slot and create a booking.
5. For a paid local Sandbox service, simulate payment success and verify booking becomes confirmed.
6. Open My Bookings, inspect detail, then test reschedule/cancel on a cancellable booking.
7. Open Consultation, create a private question attached to the active child, then open its detail and verify suggestions/lifecycle UI.
