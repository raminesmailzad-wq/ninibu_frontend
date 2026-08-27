# Ninibu Frontend v0.23.3

- Base: v0.23.2 TypeScript/build fix supplied by the user.
- Mobile care map migrated from native Google Maps (`react-native-maps`) to OpenStreetMap + Leaflet in `react-native-webview`.
- Google Maps API key injection removed from Expo config.
- Added SDK 54-compatible `react-native-webview@13.15.0`, `expo-linking~8.0.12`, and `expo-system-ui~6.0.9`.
- EAS project owner/id embedded in app configuration to avoid relinking ambiguity.
- Removed unused `runtimeVersion` policy because expo-updates is not part of this build.
- Android versionCode: 31. iOS buildNumber: 31.
- Root/Web/Mobile/shared package versions aligned to 0.23.3.
