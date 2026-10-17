# Ninibu PWA (iOS / Mobile Web)

The PWA is exported from `apps/mobile`, so Android and PWA share the same screens, navigation, forms and product flows.

## Production topology

- Public URL: `https://app.ninibu.com`
- PWA container: `127.0.0.1:3001 -> container:8080`
- API calls: same-origin `/api/...` proxied inside the PWA container to `api:8081`
- Existing Next.js web app on `ninibu.com` remains unchanged.

## Build

```bash
pnpm build:pwa
docker build -f Dockerfile.pwa -t ninibu-pwa:0.24.3 .
```

## Deploy

Set in frontend deployment `.env`:

```env
NINIBU_PWA_IMAGE=ninibu-pwa:0.24.3
```

Then recreate only the PWA service:

```bash
docker compose up -d --no-deps --force-recreate pwa
curl -I http://127.0.0.1:3001/
curl -I http://127.0.0.1:3001/manifest.webmanifest
```

Configure the host reverse proxy using `nginx-ninibu-pwa.conf.example` and provision TLS/DNS for `app.ninibu.com`.

## iPhone installation

Open `https://app.ninibu.com` in Safari, tap Share, then `Add to Home Screen`. The installed app runs in standalone mode and uses the same mobile UX as Android.
