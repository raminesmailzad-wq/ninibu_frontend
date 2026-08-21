# Ninibu Frontend v0.16.3

## Mobile safe-area correction

This release fixes the Android bottom navigation collision visible on physical devices, especially phones using the classic three-button system navigation bar.

### Changed

- `apps/mobile/app/(app)/(tabs)/_layout.tsx` now reads the device bottom inset with `useSafeAreaInsets()`.
- The tab bar height is calculated as the fixed tab content height plus the real device bottom inset.
- Bottom padding follows the device inset, with a small minimum padding for gesture-navigation devices.
- No API, authentication, backend contract, or web frontend behavior was changed.
