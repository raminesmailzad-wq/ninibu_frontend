# Frontend v0.23.4

## Mobile care map

- `nearMe()` no longer lets `expo-location` rejections escape as unhandled promises.
- Requests `Location.Accuracy.High`, checks Location Services, and on Android can request improved network/GPS provider mode.
- If a fresh fix is temporarily unavailable, a recent last-known position (<=2 minutes, <=500m) is used with a visible Persian notice.
- Approximate/coarse Android permission is detected and explained to the user.
- User location accuracy is rendered as a translucent radius on the map.
- Near-me result cards are ordered by backend `distance_km`.
- Leaflet no longer reloads the whole WebView when markers/user location change; React Native pushes state into the existing map.
- Hardware rendering, nested scrolling, no map animations, and conservative tile loading reduce Android pan/zoom jank.
- Pin markers visually match the Web care map.

No backend API contract changes.
