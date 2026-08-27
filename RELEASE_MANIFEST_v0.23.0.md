# Ninibu Frontend v0.23.0 — Release Manifest

## 1) Public Website

- Package: `apps/web`
- User-facing routes: dashboard, health, maternal health, community, discover/search/map, services/consultations, shop, notifications and profile.
- Public rich knowledge content renders sanitized HTML and media.

## 2) Admin Panel

- Route: `/admin` inside the Web package with an independent Admin shell and role gating.
- Sections: Dashboard, Content CMS, Media Library, Care Locations + Map, Advertising, Providers, Community moderation, Users/Access, Finance/Commission and System/Audit.
- Content forms use centered modal workflows and Rich Text Editor.

## 3) Native Application

- Package: `apps/mobile`
- Expo / React Native 0.23.0, Android versionCode 28.
- Public/user features remain separate from the Web-only administration surface.

## Backend dependency

Requires Ninibu Backend v0.29.0.
