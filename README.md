This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database & tests

This project uses [Neon](https://neon.tech) Postgres via [Drizzle ORM](https://orm.drizzle.team), with the `drizzle-orm/neon-serverless` (WebSocket) driver — required because parts of the app need real interactive transactions, which the `neon-http` driver doesn't support.

1. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — pooled connection string (hostname has `-pooler` in it) for app runtime.
   - `DIRECT_URL` — non-pooled connection string, used only for running migrations.
   - `NEON_API_KEY` / `NEON_PROJECT_ID` — from Neon console → Account → Developer settings, used by the test harness to create/delete an ephemeral branch per test run.
2. `pnpm db:generate` — generate a migration from `lib/db/schema.ts`.
3. `pnpm db:migrate` — apply migrations to whatever `DIRECT_URL` currently points at.
4. `pnpm test` — runs the integration suite. Before tests run, `test/setup/global-setup.ts` creates a fresh Neon branch off the project's default branch, migrates it, and points `DATABASE_URL`/`DIRECT_URL` at it for the duration of the run; the branch is deleted afterward. Tests call data-access functions directly against this real database — nothing is mocked.

Neon's free plan caps a project at 10 branches, so if a test run is killed before teardown runs, delete the stray `test/run-*` branch manually (Neon console or `neonctl branches list` / `delete`).

## Email

Transactional email goes through [Resend](https://resend.com), with templates built as React components using [React Email](https://react.email) (`lib/email/templates/`).

1. In `.env.local`, set:
   - `RESEND_API_KEY` — from the Resend dashboard.
   - `EMAIL_FROM` — the from-address; must be on a domain verified with Resend, or `onboarding@resend.dev` for local testing.
2. `pnpm email:dev` — starts React Email's local preview server for templates under `lib/email/templates/`.
3. `pnpm test` runs `lib/email/send.test.ts`, which sends a real email to Resend's sandbox address (`delivered@resend.dev`) to prove the wiring works end-to-end.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
