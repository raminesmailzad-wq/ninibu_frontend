# Ninibu Frontend v0.24.2 — Release Manifest

## Compatibility

- Required backend for Smart Booklet Import: **v0.31.2**
- Web: Next.js
- Mobile: Expo SDK 54 / React Native
- Mobile package: `com.ninibu.app`
- Android versionCode: `35`
- iOS buildNumber: `35`

## Smart Booklet changes

- Native camera capture uses `expo-camera` and displays a wide booklet-page guide while the phone remains portrait/upright.
- User copy explicitly asks for a landscape booklet page, all four corners, horizontal/readable printed text, parallel camera and no glare/shadow.
- The gallery flow does not crop the photo.
- Pixel orientation is not treated as an error; Backend v0.31.2 evaluates all right-angle rotations.
- Suggested age is shown as a whole completed month.
- Suggested dates are derived from the child DOB via shared calendar-month helpers.
- Future/impossible months and confidence below 55% are hidden client-side as a second safety layer.
- Automatic selection requires at least 80% confidence and no warning; parent confirmation remains mandatory.
- Web provides the same DOB-derived review logic and capture guidance.

## Dependencies

Mobile adds:

```text
expo-camera ~17.0.10
```

The source baseline did not contain `pnpm-lock.yaml`; run `pnpm install --no-frozen-lockfile` once in an internet-enabled environment and commit the generated lockfile before reproducible CI builds.
