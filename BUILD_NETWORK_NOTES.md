# Frontend v0.19.4 build notes

This patch hardens Docker dependency installation for unreliable access to registry.npmjs.org.

- BuildKit uses host networking during image build.
- pnpm retries downloads up to 6 times.
- Retry timeout is increased.
- pnpm network concurrency is reduced to 4.
- The persistent BuildKit pnpm store is reused with `--prefer-offline`.

Recommended deployment:

```bash
docker compose build
docker compose up -d --force-recreate
```

Do not use `--no-cache` for routine deploys. The dependency cache is useful when registry access is intermittent.
