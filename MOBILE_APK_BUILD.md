# ساخت APK اندروید نینیبو با Expo / EAS — v0.21.2

این پروژه برای تست مستقیم روی گوشی از profile به نام `preview` استفاده می‌کند. این profile در `apps/mobile/eas.json` با `android.buildType = apk` تنظیم شده است.

## پیش‌نیاز مهم این نسخه

فایل‌های دارای مجوز YekanBakh FaNum باید روی ماشین شما در مسیر زیر باقی بمانند:

- `apps/mobile/assets/fonts/YekanBakhFaNum-Regular.ttf`
- `apps/mobile/assets/fonts/YekanBakhFaNum-Medium.ttf`
- `apps/mobile/assets/fonts/YekanBakhFaNum-Bold.ttf`

این فایل‌ها نباید هنگام جایگزینی نسخه جدید حذف شوند.

همچنین `pnpm-lock.yaml` فعلی پروژه که قبلاً با `pnpm install --no-frozen-lockfile` به‌روزرسانی شده باید حفظ شود.

## 1. نصب dependencyها

از ریشه monorepo:

```bash
cd /home/ramin/projects/ninibu/ninibu_frontend
corepack enable
pnpm install --frozen-lockfile --prefer-offline
```

اگر `ERR_PNPM_OUTDATED_LOCKFILE` دیدید، فقط یک بار:

```bash
pnpm install --no-frozen-lockfile --prefer-offline
```

و بعد از آن دوباره در دفعات بعد `--frozen-lockfile` استفاده شود.

## 2. آماده‌سازی فونت و کنترل کامل موبایل

```bash
pnpm mobile:prepare-font
pnpm --filter @ninibu/mobile typecheck
pnpm mobile:apk-check
```

هر سه دستور باید بدون خطا تمام شوند. `mobile:apk-check` علاوه بر routeها، parity با پنل کاربر، YekanBakh FaNum، تنظیمات EAS، آیکن‌ها، splash، Android package و lockfile را کنترل می‌کند.

## 3. آخرین تست روی Expo Go

```bash
pnpm dev:mobile:lan
```

Metro روی پورت `8082` اجرا می‌شود. QR را در Expo Go باز کنید و حداقل Login، Home، سلامت فرزند، سلامت مادر، Community، Services، Shop، Notifications و Profile را بررسی کنید.

## 4. نصب EAS CLI

```bash
npm install -g eas-cli
eas --version
```

## 5. ورود به Expo

```bash
eas login
eas whoami
```

## 6. ورود به پوشه اپ Expo

EAS در monorepo باید از ریشه خود اپ اجرا شود:

```bash
cd /home/ramin/projects/ninibu/ninibu_frontend/apps/mobile
```

فایل `eas.json` از قبل آماده است. در اولین build، اگر پروژه هنوز به EAS متصل نشده باشد، EAS CLI فرآیند ساخت/اتصال پروژه را انجام می‌دهد. اگر صریحاً درخواست configure شد:

```bash
eas build:configure -p android
```

بعد بررسی کنید profile `preview` در `eas.json` همچنان `android.buildType: apk` دارد.

## 7. مشاهده config نهایی preview

```bash
eas config -p android -e preview
```

موارد کلیدی:

- package: `com.ninibu.app`
- version: `0.21.2`
- versionCode: `25`
- backend: `https://ninibu.com`
- preview Android build type: `apk`

## 8. ساخت APK

```bash
eas build -p android --profile preview
```

اگر اولین build است و EAS درباره Android Keystore سؤال کرد و Keystore قبلی رسمی ندارید، اجازه دهید EAS یک Keystore جدید ایجاد و مدیریت کند. آن credentials را برای buildهای بعدی حفظ کنید.

## 9. نصب روی گوشی

بعد از تکمیل cloud build، EAS لینک artifact می‌دهد. فایل `.apk` را روی گوشی دانلود کنید و نصب کنید. در صورت نیاز Android برای مرورگر/File Manager گزینه `Install unknown apps` را درخواست می‌کند.

## 10. بعد از APK تستی

برای انتشار در Google Play از profile `production` استفاده می‌شود:

```bash
eas build -p android --profile production
```

خروجی production به‌صورت پیش‌فرض Android App Bundle (`.aab`) است؛ APK برای نصب مستقیم و تست داخلی در profile `preview` استفاده می‌شود.
