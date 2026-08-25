# Mobile lockfile note — v0.21.2

این ZIP عمداً `pnpm-lock.yaml` را جایگزین نمی‌کند.

روی سرور شما lockfile بعد از اضافه‌شدن `expo-font` و `expo-location` با دستور زیر قبلاً به‌روزرسانی شده است:

```bash
pnpm install --no-frozen-lockfile --prefer-offline
```

از v0.21.1 به v0.21.2 dependency جدیدی اضافه نشده است؛ بنابراین همان `pnpm-lock.yaml` فعلی معتبر است و باید حفظ شود.

بعد از جایگزینی نسخه:

```bash
pnpm install --frozen-lockfile --prefer-offline
pnpm --filter @ninibu/mobile typecheck
pnpm mobile:apk-check
```

اگر پروژه را در یک پوشه کاملاً خالی استخراج می‌کنید، ابتدا `pnpm-lock.yaml` فعلی مخزن خودتان را به ریشه برگردانید؛ سپس دستورات بالا را اجرا کنید.
