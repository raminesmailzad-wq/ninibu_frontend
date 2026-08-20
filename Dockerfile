# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/api/package.json packages/api/package.json
COPY packages/datetime/package.json packages/datetime/package.json
COPY packages/design/package.json packages/design/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/validation/package.json packages/validation/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/ ./
COPY . .

ARG NEXT_PUBLIC_NINIBU_DEV_OTP=""
ARG NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT=""
ARG NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER="sandbox"
ENV NEXT_PUBLIC_NINIBU_DEV_OTP="$NEXT_PUBLIC_NINIBU_DEV_OTP" \
    NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT="$NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT" \
    NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER="$NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER" \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @ninibu/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
