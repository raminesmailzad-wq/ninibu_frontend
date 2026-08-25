# Ninibu Mobile — Expo / React Native v0.21.2

اپ موبایل بومی نینیبو بر پایه Expo Router / React Native و Expo SDK 54.

## اجرای تست روی گوشی با Expo Go

از ریشه پروژه:

```bash
pnpm install --no-frozen-lockfile --prefer-offline
pnpm --filter @ninibu/mobile typecheck
pnpm dev:mobile:lan
```

Metro روی پورت 8082 اجرا می‌شود تا با Backend روی 8081 تداخل نداشته باشد.

## فونت

برای YekanBakh FaNum فایل‌های دارای مجوز خودتان را طبق `assets/fonts/README.txt` در پوشه فونت قرار دهید و سپس:

```bash
pnpm mobile:prepare-font
```

## APK

دستور اصلی ساخت APK تستی:

```bash
cd apps/mobile
eas build -p android --profile preview
```

جزئیات کامل در `../../MOBILE_APK_BUILD.md` است.
