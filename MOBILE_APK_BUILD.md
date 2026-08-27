# ساخت APK اندروید نینیبو با Expo / EAS — v0.23.4

## قبل از Build

- فایل‌های مجاز YekanBakh FaNum خودتان در `apps/mobile/assets/fonts` باقی بمانند.
- `react-native-maps` و Google Maps API Key دیگر استفاده نمی‌شوند.
- نقشه مراکز از OpenStreetMap + Leaflet داخل `react-native-webview` استفاده می‌کند.

چون بسته مبنای v0.23.2 lockfile نداشت، پس از جایگزینی این نسخه یک بار از ریشه repository اجرا کنید:

```bash
cd /home/ramin/projects/ninibu/ninibu_frontend
pnpm install --no-frozen-lockfile --prefer-offline
```

سپس:

```bash
pnpm install --frozen-lockfile --prefer-offline
pnpm --filter @ninibu/mobile typecheck
pnpm mobile:apk-check
```

## تست Expo Go

```bash
pnpm dev:mobile:lan
```

به‌خصوص «کشف → مراکز»، انتخاب marker، «نزدیک من» و انتخاب مرکز از لیست را تست کنید.

## EAS

```bash
cd /home/ramin/projects/ninibu/ninibu_frontend/apps/mobile
npm install -g eas-cli
eas login
eas project:info
eas config -p android -e preview
```

Project config این نسخه از قبل شامل موارد زیر است:

- owner: `raminesi`
- projectId: `e614fc0c-d8b4-4521-8916-e4558762fa94`
- package: `com.ninibu.app`
- version: `0.23.4`
- Android versionCode: `31`
- preview buildType: `apk`

## Cloud build

```bash
eas build -p android --profile preview
```

## Local build روی Ubuntu

اگر Cloud upload در شبکه شما با 403 مواجه شد، همان محیط Android SDK/CMake که قبلاً آماده شده را استفاده کنید:

```bash
export PATH="$HOME/.local/cmake-3.22.1/bin:$PATH"

eas build \
  -p android \
  --profile preview \
  --local \
  --output ./ninibu-v0.23.4-preview.apk
```

## نصب و تشخیص خطای نصب

```bash
adb install -r ./ninibu-v0.23.4-preview.apk
```

اگر نسخه‌ای با امضای متفاوت روی گوشی نصب است، ابتدا با آگاهی از پاک‌شدن داده محلی آن را حذف کنید:

```bash
adb uninstall com.ninibu.app
adb install ./ninibu-v0.23.4-preview.apk
```
