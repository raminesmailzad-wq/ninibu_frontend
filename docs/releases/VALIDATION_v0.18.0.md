# Validation — Ninibu Frontend v0.18.0

- All newly added Admin TS/TSX files and changed shared API/type files were parsed with TypeScript `transpileModule`; no syntax diagnostics were reported.
- The admin proxy preserves query strings and forwards GET/POST/PUT/PATCH/DELETE using the existing authenticated Backend helper.
- Centered Admin Modal CSS uses fixed full-viewport positioning and a higher z-index.
- Admin campaign date entry uses the existing Jalali date picker; no raw Gregorian `date`/`datetime-local` picker remains in Admin forms.
- Direct `/admin` access resolves the current authenticated session and rejects non-admin/non-super-admin roles.

The extracted delivery workspace does not contain `node_modules`; therefore a full Next build cannot be truthfully reported from this environment. Production CI should run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```
