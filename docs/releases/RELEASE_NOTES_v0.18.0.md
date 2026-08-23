# Ninibu Frontend v0.18.0 — Web Admin Control Center

## New Web Backoffice

A dedicated `/admin` experience has been added to the Next.js Web application. The parent-facing mobile app is intentionally unchanged for administration.

Admin sections:

- Operational dashboard and aggregate KPIs
- Content creation, revision, medical-review submission, publishing and archiving
- Advertising: advertisers, campaigns, creatives, approval/rejection/pause and performance reports
- Unified provider verification: clinicians and commerce/service providers
- Community moderation reports and moderation actions
- Users, account status and RBAC
- Finance/commission summary
- Feature Flags, global System Settings and Audit Trail

## Access model

- `admin`: day-to-day operational management.
- `super_admin`: everything Admin can do, plus changing management roles and editing global non-secret System Settings.
- Non-staff users receive a forbidden screen even if they navigate directly to `/admin`.
- The backend is authoritative; UI role gating is not relied upon for security.

## UI

- Responsive Persian RTL backoffice shell.
- All management forms use centered viewport Modals.
- Campaign start/end dates use the project Jalali date picker (nested higher-z-index modal) with separate time inputs.
- Mobile-width browser layouts collapse the desktop navigation while keeping admin tables horizontally scrollable.
- Sensitive secret configuration is not surfaced.

## API integration

A generic authenticated Next BFF route under `/api/ninibu/admin/[...path]` forwards the existing HttpOnly-cookie session to Backend v0.26.0 admin routes.
