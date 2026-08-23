# Validation — Ninibu Frontend v0.18.1

Current release validation is documented in `docs/releases/VALIDATION_v0.18.1.md`.

The Web Admin Control Center from v0.18.0 is retained. The parent mobile application remains v0.17.0 intentionally. Production CI should run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```
