# Ninibu Frontend v0.23.3 — OpenStreetMap Mobile Map

## Mobile map change

- The Android/iOS care-directory map no longer uses `react-native-maps` or the native Google Maps SDK.
- Mobile now renders OpenStreetMap raster tiles through Leaflet inside `react-native-webview`.
- No Google Maps API key, SHA-1 restriction or `com.google.android.geo.API_KEY` manifest metadata is required.
- Tapping a marker selects the matching care location in React Native.
- Tapping a care-location card highlights and centers the matching map marker.
- "نزدیک من" still uses `expo-location`; precise coordinates are requested only after the user action and are not persisted to the profile.
- If the embedded map cannot load, the care-location list remains usable and the app does not crash.

## Tile endpoint

Development/preview default:

```env
EXPO_PUBLIC_NINIBU_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

The public OpenStreetMap tile service is appropriate for development and light testing. For high-volume production traffic, configure a production tile provider or self-hosted OSM-compatible tiles and keep the required OpenStreetMap attribution.

## Web

The Web care map remains MapLibre-based and keeps its separate `NEXT_PUBLIC_NINIBU_MAP_TILE_URL` configuration.
