# تست موبایل نینیبو v0.21.2 با Expo Go

## نصب dependencyها
این نسخه دو dependency جدید موبایل دارد: `expo-font` و `expo-location`. بعد از جایگزینی نسخه یک بار اجرا کنید:

```bash
cd /home/ramin/projects/ninibu/ninibu_frontend
pnpm install --no-frozen-lockfile --prefer-offline
```

بعد از همگام‌شدن lockfile، نصب‌های بعدی می‌توانند frozen باشند.

## فونت YekanBakh FaNum
فایل‌های دارای مجوز را طبق `apps/mobile/assets/fonts/README.txt` قرار دهید، سپس:

```bash
pnpm mobile:prepare-font
```

## بررسی

```bash
pnpm --filter @ninibu/mobile typecheck
```

pretypecheck به‌صورت خودکار این auditها را هم اجرا می‌کند:
- preflight Expo
- Hook order
- Web/mobile user parity markers
- shared font-family audit

## اجرا روی گوشی

```bash
pnpm dev:mobile:lan
```

Metro روی 8082 اجرا می‌شود. گوشی و سیستم باید روی یک شبکه باشند. در صورت نیاز:

```bash
pnpm dev:mobile:tunnel
```

Backend پیش‌فرض موبایل `https://ninibu.com` است.
