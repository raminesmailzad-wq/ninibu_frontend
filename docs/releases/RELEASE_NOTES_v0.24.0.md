# Ninibu Frontend v0.24.0 — Smart Booklet Import

## User flow

In child Health → Growth, the parent can choose **انتقال از دفترچه**. The UI then:

1. asks which supported growth chart is being captured;
2. captures/selects a JPEG/PNG photo;
3. explains that the image is processed for extraction and is not retained by Ninibu;
4. submits the photo to Backend v0.31.0;
5. displays candidate points with confidence and warnings;
6. allows each row to be accepted/rejected and lets the parent correct date/value;
7. submits confirmation and refreshes the existing WHO growth views.

## Web

- Centered Smart Booklet modal under the Health dashboard.
- Uses the existing nested Jalali date modal.
- New Next.js BFF routes forward authenticated multipart analyze requests and JSON confirm requests to the Go backend.
- `FormData` is not assigned `application/json`; browser/Next runtime owns the multipart boundary.

## Mobile

- Native camera and photo-library actions via Expo Image Picker.
- Camera/photos permission descriptions are included in Expo config.
- Direct multipart upload uses the existing bearer-token API client and refresh flow.
- Review UI mirrors Web behavior.

## Shared contracts

`@ninibu/api` exposes document-import paths. `@ninibu/types` exposes document-import payloads and growth provenance fields.

## MVP boundaries

- Requires Backend v0.31.0.
- Supported charts: weight-for-age (first-year supported template panel), height-for-age and head-circumference-for-age.
- Weight-for-height, vaccination table and screening/visit handwriting are not import options in this release.
- The user must confirm extracted values; the frontend never treats confidence as medical verification.
