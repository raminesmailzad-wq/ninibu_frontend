# Ninibu Frontend v0.19.2 — Docker deployment

This package targets the current Ninibu server topology:

- Ubuntu host Nginx terminates HTTPS for `ninibu.com`.
- Backend v0.26.1 is running on Docker network `ninibu-backend_ninibu_backend`.
- MySQL runs directly on the host machine; the frontend never connects to MySQL.
- Backend API is reachable from the frontend container as `http://api:8081`.
- Frontend is exposed only on host loopback at `127.0.0.1:3000`.
- Nginx proxies normal web traffic to the frontend and `/api/v1/*` to the backend.

## Build and start

```bash
cd /opt/ninibu/ninibu_frontend
sudo docker compose build
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100 frontend
```

The default image tag is `ninibu-frontend:0.19.2`. Override it when needed:

```bash
NINIBU_FRONTEND_IMAGE=registry.example/ninibu-frontend:0.19.2 docker compose up -d
```

If Compose reports that external network `ninibu-backend_ninibu_backend` does not exist, start the backend first and verify:

```bash
sudo docker network ls | grep ninibu
```

## Local host smoke test

```bash
curl -I http://127.0.0.1:3000
```

The frontend container reaches the backend through the shared Docker network. `NINIBU_BACKEND_URL=http://api:8081` is server-side only and must not be exposed as a `NEXT_PUBLIC_*` value.

## Nginx

Merge `nginx-ninibu.conf.example` into the existing TLS server block and preserve the certificate directives, then:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://ninibu.com
```

Routing split:

- `/api/v1/*` -> `127.0.0.1:8081` (Go backend)
- everything else, including `/api/ninibu/*` -> `127.0.0.1:3000` (Next.js frontend/BFF)

## Public build variables

`NEXT_PUBLIC_*` values are compiled into the browser bundle at build time. Current defaults are:

- `NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT` empty
- `NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER=sandbox`

Rebuild the frontend image whenever these values change.

## Persistence

The frontend is stateless and has no persistent Docker volume. Recreating the frontend container does not affect host MySQL or backend data.
