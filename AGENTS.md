<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Use Node 22 and `pnpm install --frozen-lockfile` (pnpm 11.9.0 is pinned in `package.json`).
- The dev server must use the Neon branch named `development`. `pnpm db:seed` deletes artworks and site settings; do not run it against the `production` branch.
- `pnpm test` and `pnpm test:e2e` create a temporary Neon branch and need `NEON_API_KEY` and `NEON_PROJECT_ID`. `RESEND_API_KEY`, `EMAIL_FROM`, and `ADMIN_EMAIL` must be non-empty so email modules load; the Vitest suite mocks sending.
- `pnpm lint` runs ESLint. `pnpm test` is the Vitest integration suite. `pnpm test:e2e` is Playwright and needs `pnpm exec playwright install chromium` first.
