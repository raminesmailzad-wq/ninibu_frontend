# تست موبایل نینیبو v0.24.2 با Expo Go

## 1. همگام‌سازی dependencyها

Smart Booklet v0.24.2 علاوه بر `expo-image-picker` از `expo-camera ~17.0.10` برای دوربین دارای کادر افقی استفاده می‌کند.

این نسخه نقشه native گوگل را حذف کرده و `react-native-webview` را جایگزین کرده است. همچنین `expo-linking` و `expo-system-ui` برای build مستقل SDK 54 در dependencies حضور دارند.

چون ZIP مبنای v0.23.2 شامل `pnpm-lock.yaml` نبود، در repository فعلی فقط یک بار اجرا کنید:

```bash
cd /home/ramin/projects/ninibu/ninibu_frontend
pnpm install --no-frozen-lockfile --prefer-offline
```

بعد از آن نصب‌های بعدی باید با `--frozen-lockfile` انجام شوند.

## 2. فونت YekanBakh FaNum

فایل‌های دارای مجوز خودتان را در `apps/mobile/assets/fonts` حفظ کنید. Regular و Bold الزامی هستند؛ اگر Medium موجود نباشد، پروژه به Regular fallback می‌کند.

```bash
pnpm mobile:prepare-font
```

## 3. کنترل موبایل

```bash
pnpm --filter @ninibu/mobile typecheck
pnpm mobile:apk-check
```

## 4. اجرا روی گوشی

```bash
pnpm dev:mobile:lan
```

Metro روی 8082 اجرا می‌شود. Backend پیش‌فرض `https://ninibu.com` است.

در بخش «کشف → مراکز»، نقشه باید با OpenStreetMap باز شود و دیگر هیچ Google Maps API Key لازم نیست. برای tile endpoint سفارشی:

```env
EXPO_PUBLIC_NINIBU_MAP_TILE_URL=https://your-provider.example/{z}/{x}/{y}.png
```
