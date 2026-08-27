# Map & Near-Me — v0.23.4

## Location flow

- Uses `expo-location` high accuracy for the one-shot «نزدیک من» action.
- Checks whether device location services are enabled.
- Android may prompt for improved GPS/network-provider accuracy.
- A fresh fix is preferred; only if it is unavailable after a bounded wait, a recent last-known fix (<=2 min and <=500m) may be used.
- Permission/provider errors are caught and rendered in Persian; they no longer surface as unhandled promise rejections.
- Android approximate/coarse permission and reported meter accuracy are surfaced to the user.

## Map rendering

- OpenStreetMap + Leaflet remains the renderer; Google Maps is not used.
- The WebView HTML is created once. Result/location changes are pushed through `injectJavaScript`, avoiding full map reloads.
- Android hardware rendering + nested scrolling are enabled.
- Leaflet zoom/fade/marker animations are disabled and raster tile buffering is increased.
- Near-me mode centers on the user's live fix and renders the accuracy radius.
- Care-location pins match Web: purple teardrop with white edge; selected pin is larger and green.

Tile provider remains configurable with `EXPO_PUBLIC_NINIBU_MAP_TILE_URL`.
