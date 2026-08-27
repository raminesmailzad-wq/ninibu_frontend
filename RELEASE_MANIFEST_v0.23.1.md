# Ninibu Frontend v0.23.1 — Release Manifest

## Public Website
- Package: `apps/web`
- User-facing routes: dashboard, health, maternal health, community, discover/search/map, services/consultations, shop, notifications and profile.
- Care map updated for MapLibre GL JS v6 ESM named exports.

## Admin Panel
- Route: `/admin` inside the Web package with an independent Admin shell and role gating.
- Sections include Dashboard, Content CMS, Media Library, Care Locations + Map, Advertising, Providers, Community moderation, Users/Access, Finance/Commission and System/Audit.
- Content forms use centered modal workflows and Rich Text Editor.

## Native Application
- Package: `apps/mobile`
- Expo / React Native 0.23.1, Android versionCode 29, iOS buildNumber 29.

## Backend dependency
Requires Ninibu Backend v0.29.0.
