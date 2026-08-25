# Mobile v0.21.1 fix

If v0.21.0 was extracted over older mobile sources, legacy route files can remain on disk because ZIP extraction does not delete files that disappeared in newer versions. The stale `apps/mobile/app/(auth)/index.tsx` was scanned by the font audit even though the live route is now `login.tsx`.

v0.21.1 cleans those legacy files automatically during mobile preflight.

After replacing the project files, keep your current `pnpm-lock.yaml` and run:

```bash
pnpm --filter @ninibu/mobile typecheck
pnpm dev:mobile:lan
```
