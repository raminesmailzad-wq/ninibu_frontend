# Ninibu Mobile

Reserved for the Expo + React Native client.

Frontend v0.2.0 deliberately keeps mobile-native initialization deferred while the web application establishes the shared contracts and design language. The future mobile application will reuse:

- `@ninibu/api`
- `@ninibu/types`
- `@ninibu/design`
- `@ninibu/validation`

It should be initialized from the then-current Expo template on a machine with registry access so Expo SDK and React Native versions are selected compatibly rather than guessed in this artifact environment.
