# Ninibu Frontend v0.23.3

## Mobile care map

The native care-directory map has been migrated away from Google Maps SDK. The mobile app now uses OpenStreetMap raster tiles through Leaflet rendered in `react-native-webview`.

### User-visible behavior preserved

- map markers for care locations
- tap marker to select a location
- tap list item to focus the corresponding marker
- current-location search through `expo-location`
- call action and OpenStreetMap location/directions handoff
- Persian UI and YekanBakh FaNum typography

### Reliability

- no Google Maps API key or Android manifest `com.google.android.geo.API_KEY` is required
- failure to load the embedded map no longer terminates the Android process; the care-location list remains available
- multiple Leaflet CDN fallbacks are configured for the embedded renderer
- tile URL can be replaced through `EXPO_PUBLIC_NINIBU_MAP_TILE_URL`

### Build

- `react-native-maps` removed
- `react-native-webview@13.15.0` added for Expo SDK 54
- `expo-linking~8.0.12` and `expo-system-ui~6.0.9` restored for standalone-build compatibility
- Android versionCode 31 / iOS buildNumber 31
