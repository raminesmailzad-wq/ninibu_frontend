# Ninibu Mobile v0.20.2

Fixes the Expo Go runtime crash on the Home tab caused by a React hook being reached only after the child-loading early return.

After replacing the project files, keep the already-regenerated pnpm-lock.yaml from your working tree (dependencies are unchanged from v0.20.1), then run:

pnpm --filter @ninibu/mobile typecheck
pnpm dev:mobile:lan

The LAN command clears Metro cache. Fully reload/reopen the project in Expo Go after Metro restarts.
