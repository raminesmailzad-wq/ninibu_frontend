# Ninibu Frontend v0.22.0 — Care Map + Unified Search

## What changed

- Web care-directory view now renders an embedded MapLibre map with selectable facility markers.
- Web care directory supports name/alias search, facility type, specialty, child-acceptance and explicit "near me" geolocation.
- Mobile care-directory view now renders `react-native-maps` markers and shares the same discovery endpoint.
- Unified Search recognizes `care_location`; opening a care-location result switches to the care tab and searches the same directory record.
- Shared `CareLocation` types now include specialties, services, contact/source metadata and child/emergency flags.

## Map configuration

### Web

`NEXT_PUBLIC_NINIBU_MAP_TILE_URL` can override the raster tile template. The development fallback is the public OpenStreetMap tile endpoint and includes OSM attribution. **Do not use the fallback as a high-volume production tile service**; configure a production provider or self-hosted tiles.

Example:

```env
NEXT_PUBLIC_NINIBU_MAP_TILE_URL=https://your-tile-provider.example/{z}/{x}/{y}.png
```

### Expo / Android + iOS

Standalone builds using `react-native-maps` can read the Google Maps key from:

```env
EXPO_GOOGLE_MAPS_API_KEY=...
```

`apps/mobile/app.config.js` adds it to the native Expo map configuration only when the environment variable exists.

## Privacy

Precise device location is requested only after the user taps "نزدیک من". The frontend sends the coordinate to the discovery API for that request and does not write it into the user profile.
