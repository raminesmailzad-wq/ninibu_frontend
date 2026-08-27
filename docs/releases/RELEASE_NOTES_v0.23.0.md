# Ninibu Frontend v0.23.0 — Admin CMS & Media Operations

## Admin

- Reworked Knowledge administration into dedicated content, category and tag tabs.
- Added create/edit/delete workflows for categories and tags.
- Added content metadata editing and controlled deletion in addition to revision/review/publish/archive workflow.
- Added an integrated rich-text editor for article/guide forms with headings, emphasis, lists, block quotes, links, undo/redo and media insertion.
- Added Media Library with grid preview, file upload, external assets, licensing/source metadata, approval status and delete/edit actions.
- Added full Care Location management with searchable table, map selection, create/edit/delete forms, specialties/services, directory verification and source/licence fields.

## Media delivery

- Added a binary-safe Next.js multipart upload proxy.
- Added a public media proxy so canonical backend media URLs can be rendered in web rich content without exposing the backend origin.
- Knowledge detail renders sanitized rich HTML; the mobile client degrades rich HTML to readable plain text.

## Map

- `NEXT_PUBLIC_NINIBU_MAP_TILE_URL` can configure the production tile provider. The development fallback remains OpenStreetMap raster tiles and should not be used as production infrastructure.

## Build notes

- Web depends on `maplibre-gl`.
- Mobile depends on `react-native-maps`; standalone Google Maps builds should configure `EXPO_GOOGLE_MAPS_API_KEY`.
