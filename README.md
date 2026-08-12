# Ninibu Frontend

Frontend monorepo for Ninibu, aligned with Backend v0.22.2.

## v0.4.0 scope — Consultation, Services & Booking

This release turns the **Services** navigation item into a real user-facing product surface and connects it to the existing consultation, commerce service, booking and payment modules in Backend v0.22.2.

Implemented:

- Service catalog with search and category filtering.
- Service detail, delivery type, provider, duration and price presentation.
- Live booking availability from the backend schedule engine.
- Child-aware booking with an explicit privacy notice: selecting a child does not grant health-record access.
- Free-service instant booking and paid-service `pending_payment` flow.
- Payment creation through the Next.js BFF, with sandbox success/failure controls only when the backend actually returns the `sandbox` provider.
- User booking history, meeting links, cancellation and rescheduling.
- Defensive booking de-duplication because Backend v0.22.2 currently duplicates items in its `ListBookings` response loop; no booking data is lost or merged beyond identical IDs.
- Asynchronous parent consultation: categories, create question, private/public/anonymous-public privacy modes, child attachment, question list and detail.
- Official-answer badge, answer acceptance, follow-up messages, close/reopen lifecycle and backend-generated non-diagnostic suggestions.
- Public answered consultation questions as a separate view.
- Responsive desktop/mobile states using the existing Ninibu design tokens.
- Typed shared contracts and API route builders reusable by the future Expo/React Native client.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS v4
- shadcn/ui-style open component conventions
- Zod
- TanStack Query
- Lucide React
- pnpm workspaces + Turborepo

The future Expo/React Native client can reuse `@ninibu/api`, `@ninibu/types`, `@ninibu/design` and `@ninibu/validation` without sharing Next-specific UI code.

## Local run

Requirements: Node.js 22+, Corepack/pnpm, and Ninibu Backend v0.22.2 running locally.

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
NINIBU_BACKEND_URL=http://localhost:8080
```

Suggested smoke flow: login → choose active child → Services → open service → choose slot → book → sandbox payment (for local backend) → My Bookings → Consultation → create private question → open detail.

## Validation caveat

The packaging environment cannot install the npm dependency graph, so `pnpm typecheck`, ESLint, Vitest and `next build` for **v0.4.0** remain developer/stage gates. TypeScript/TSX syntax, route-contract alignment, JSON manifests, archive integrity and release exclusions are checked during packaging. See `VALIDATION.md`.
