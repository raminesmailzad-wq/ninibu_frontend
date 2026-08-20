# Validation — Ninibu Frontend v0.15.0

## Scope

Password-first authentication UI/BFF aligned with Ninibu Backend v0.24.0.

## Checks performed

- Parsed/transpiled 177 TypeScript/TSX source files with TypeScript 5.8.3: zero syntax/transpile diagnostics.
- Jalali date policy audit passes.
- Login UI defaults to mobile + password and does not request an OTP.
- Signup requires mobile, password and password confirmation before the OTP request.
- Password recovery requires the new password and confirmation before the OTP request.
- Existing backend accounts returning `PASSWORD_SETUP_REQUIRED` are routed to the password-bootstrap recovery flow.
- BFF routes for login, signup and reset store access/refresh tokens using the existing HttpOnly cookie boundary.
- Legacy OTP-login frontend routes remain unused by the UI; the backend rejects them without SMS.
- Root, web and workspace package versions are `0.15.0`; Docker image tag is `0.15.0`.
- Existing centered Modal/Jalali Date Picker/navigation behavior outside authentication is unchanged.

## Build environment note

The packaging environment has Node.js 22 and TypeScript 5.8.3 but does not contain `node_modules`; Corepack cannot download pnpm because outbound registry access is blocked. This report therefore does not claim a dependency-resolving Next.js build/lint/typecheck. A syntax parse of TypeScript/TSX sources and the Jalali date-policy audit passed during packaging; run `pnpm install --frozen-lockfile && pnpm typecheck && pnpm lint && pnpm build` in CI before production deployment.
