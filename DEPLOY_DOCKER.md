# Ninibu Frontend v0.15.0 — Docker deployment

This package is prepared for the current Ninibu home-server deployment:

- Ubuntu host Nginx terminates HTTPS for `ninibu.com`.
- Backend Compose is already running on Docker network `ninibu-backend_ninibu_backend`.
- Backend API service is reachable inside that network as `http://api:8081`.
- Frontend is exposed only on host loopback: `127.0.0.1:3000`.
- Nginx proxies normal web traffic to the frontend and may keep `/api/v1/*` pointed directly at backend port `127.0.0.1:8081`.

## Build and start

```bash
cd /opt/ninibu/ninibu_frontend
sudo docker compose build
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100 frontend
```

If Compose reports that external network `ninibu-backend_ninibu_backend` does not exist, verify the backend is running:

```bash
sudo docker network ls | grep ninibu
```

The backend deployment seen on this server creates `ninibu-backend_ninibu_backend`.

## Local host smoke test

```bash
curl -I http://127.0.0.1:3000
```

The frontend container itself can reach backend at `http://api:8081`; this URL is server-side only and is not exposed as a `NEXT_PUBLIC_*` value.

## Nginx

Merge `nginx-ninibu.conf.example` into the existing `server { listen 443 ssl; ... }` block that Certbot configured for `ninibu.com`. Keep the existing certificate directives.

Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://ninibu.com
```

The important routing split is:

- `/api/v1/*` -> `127.0.0.1:8081` (Go backend)
- everything else, including `/api/ninibu/*` -> `127.0.0.1:3000` (Next.js frontend/BFF)

## Public build variables

`NEXT_PUBLIC_*` values are compiled into the Next.js browser bundle at build time. The Compose defaults are suitable for the current staging/sandbox deployment:

- `NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT` empty
- `NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER=sandbox`

If any of these change, rebuild the frontend image.

## Persistence

The frontend is stateless and has no persistent Docker volume. User data remains in the backend/MySQL stack. Recreating or deleting the frontend container does not delete application data.
