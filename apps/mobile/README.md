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

Scan the QR code with Expo Go.

If LAN discovery fails:

```bash
pnpm dev:mobile:tunnel
```

## Backend URL

The default development behavior derives the computer IP from Metro and connects to port `8080`:

```text
http://<metro-computer-ip>:8080
```

For an explicit backend address:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Then set:

```env
EXPO_PUBLIC_NINIBU_BACKEND_URL=http://192.168.1.20:8080
```

The backend must listen on an address reachable by the phone (for example `0.0.0.0:8080`) and the firewall must allow the port. `localhost` on the phone is the phone itself.

## Native authentication

Web authentication continues to use the Next.js BFF + HttpOnly cookies. Mobile talks directly to the Go backend and stores only the access/refresh credentials in `expo-secure-store`. Password is never persisted by the mobile client.

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
- Community feed and group membership
- Discover/search and personalization feed
- Services, bookings, consultations and sandbox payment flow
- Store catalog, variants, cart, checkout, orders and sandbox payment flow
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

`eas.json` is already included. Production should use an HTTPS backend URL.
