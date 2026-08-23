# Ninibu Mobile — Expo / React Native

Native Android/iOS client for Ninibu. This is not a WebView.

## Stack

- Expo SDK 54
- React Native 0.81 / React 19.1
- Expo Router
- Expo SecureStore for access/refresh tokens
- Shared workspace packages: `@ninibu/api`, `@ninibu/types`, `@ninibu/design`, `@ninibu/validation`, `@ninibu/datetime`

## Run on a real Android phone (no Android Studio)

From the repository root:

```bash
corepack enable
pnpm install --no-frozen-lockfile
pnpm dev:mobile:clear
```

Scan the QR code with Expo Go. If LAN discovery fails, use:

```bash
pnpm dev:mobile:tunnel
```

## Backend URL

The mobile client defaults to the production HTTPS API:

```text
https://ninibu.com
```

For an explicit local-development backend:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Then set an address that the physical phone can reach, for example:

```env
EXPO_PUBLIC_NINIBU_BACKEND_URL=http://192.168.1.20:8081
```

For this LAN-only development case, the Go backend must intentionally listen on a LAN-reachable interface and the host firewall should restrict access to the trusted development network. The production Docker deployment intentionally publishes the API only on `127.0.0.1:8081` behind Nginx, so do not open the production API port merely for Expo testing.

## Native authentication

Web authentication continues to use the Next.js BFF + HttpOnly cookies. Mobile talks directly to the Go backend and stores only access/refresh credentials in `expo-secure-store`. Password is never persisted by the mobile client.

Flows implemented:

- Password login
- Signup with SMS verification
- Password recovery with SMS verification
- Access-token refresh
- Secure local sign-out
- Existing OTP-only account migration through password setup

## Mobile feature surface

- Persian/RTL onboarding and parent profile
- Child switcher and add-child flow
- Dashboard and action shortcuts
- Health record: growth, WHO growth context, vaccines, visits, allergies, medications
- Maternal health and breastfeeding guidance
- Clinician-approved child nutrition recommendations
- Community feed, post comments and group membership
- Discover/search and personalization feed
- Services, bookings and consultations
- Store catalog, cart, checkout and orders
- Notifications and in-app notification preferences
- Advertising consent controls
- Jalali date input/display with Gregorian API boundary

## Cloud APK later, still without Android Studio

After testing in Expo Go, an installable APK can be produced with EAS cloud build:

```bash
cd apps/mobile
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

`eas.json` is already included. Production should use the HTTPS backend URL.
