# Code Standards

Conventions actually in use in this codebase. When in doubt, match the nearest existing example over anything written here — this file describes the codebase, the codebase doesn't have to describe this file.

For domain terminology (what an "Artwork" is, why "Cart" and not "bag", etc.) see **[CONTEXT.md](./CONTEXT.md)** — this document does not repeat the glossary, only points at it (see [Domain vocabulary](#domain-vocabulary) below). For the reasoning behind major technical choices, see **[docs/adr/](./docs/adr/)**.

## Stack

- **Next.js (App Router)** + React 19, TypeScript in `strict` mode.
- **Drizzle ORM** against Neon Postgres, using the `drizzle-orm/neon-serverless` (WebSocket) driver — required for real interactive transactions (`neon-http` doesn't support them).
- **Tailwind CSS v4** for styling, `shadcn` for base UI primitives.
- **Vitest** for tests, run as integration tests against a real, ephemeral Neon branch (see [Testing](#testing)).
- **pnpm** exclusively (pinned via `packageManager` in `package.json`); Node version pinned in `.nvmrc`; `tsx` runs standalone TS scripts (`scripts/`).

## Directory layout

```
app/                    # Next.js App Router routes/pages (Server Components by default)
components/<area>/      # Page/feature-scoped components (e.g. components/homepage/)
components/ui/          # shadcn base primitives
lib/db/                 # Drizzle schema, data-access functions, colocated tests
lib/utils.ts            # Small cross-cutting helpers (e.g. cn())
test/setup/              # Ephemeral-Neon-branch test harness (global setup/teardown)
scripts/                # Standalone scripts run via tsx (CI helpers, seeding)
scripts/ci/             # CI-only scripts invoked from .github/workflows
drizzle/                # Generated SQL migrations + snapshots — check these in, don't hand-edit
docs/adr/               # Architecture decision records
docs/agents/            # Process docs for agent workflows (issue tracker, triage, domain docs)
```

Filenames are kebab-case (`site-settings.ts`, `featured-artworks.tsx`). One component per file, exported as a named `PascalCase` function matching the filename. Data-access modules live at `lib/db/<entity>.ts` with a colocated `lib/db/<entity>.test.ts`.

## Data access (`lib/db/`)

- Table definitions live in one place: `lib/db/schema.ts`. Columns are `snake_case` in Postgres, mapped to `camelCase` TS fields via Drizzle's column builders (e.g. `priceCents: integer("price_cents")`).
- Schema changes go through Drizzle Kit, never hand-written SQL: `pnpm db:generate` to diff the schema into a new migration under `drizzle/`, `pnpm db:migrate` to apply. Generated migrations and snapshots are committed.
- Data-access functions are plain async exports, one concern per function (`getFeaturedArtworks`, `getSiteSettings`, `pingDatabase`), marked `"use server"` at the top of the file when called from Server Components.
- Prefer the relational query API (`db.query.<table>.findMany({ where, orderBy, with })`) when relations need to come along for the ride; drop to the plain query builder (`db.select()...`) for a flat single-table read. Follow `lib/db/artworks.ts` / `lib/db/site-settings.ts` as the reference shape.
- Fail fast on missing configuration: throw immediately for a missing required env var (`DATABASE_URL`, `NEON_API_KEY`, etc. — see `lib/db/client.ts`, `test/setup/neon-branch.ts`) rather than silently falling back to a default.

## Validation (Zod)

Zod is this project's chosen library for validating untrusted input (form submissions, API route bodies) once those land — it isn't exercised yet since no forms/API routes exist in the codebase today. When adding one: parse into a Zod schema right at the boundary and pass the resulting typed value inward; don't re-validate the same input further down the call stack.

## React / Next.js patterns

- Prefer a `shadcn` primitive over hand-rolled markup for anything interactive (selection, toggling, overlays, form controls) — reach for `components/ui/*` first, and add a missing primitive with `pnpm dlx shadcn@latest add <component>` rather than building the interaction (state, keyboard nav, aria attributes) from scratch. Plain Tailwind-styled `div`/`span`/`Link` markup is still fine for purely presentational, non-interactive layout (image grids, text blocks) that isn't a reusable primitive — see `components/homepage/featured-artworks.tsx` for the existing pattern this project follows for that case.
- Components are Server Components by default (no `"use client"` unless the component actually needs interactivity/state).
- Fetch data at the top of the route/page (`app/page.tsx`), in parallel with `Promise.all` when the fetches are independent, and pass already-shaped data down as props — presentational components (`components/homepage/*`) don't fetch internally.
- Derive prop types from the data-access function rather than hand-declaring a parallel shape:
  ```ts
  type FeaturedArtwork = Awaited<
    ReturnType<typeof getFeaturedArtworks>
  >[number];
  ```
- Styling is Tailwind utility classes directly in JSX; use the `cn()` helper (`lib/utils.ts`, `clsx` + `tailwind-merge`) when classes are conditional or need merging — no CSS modules, no styled-components.
- Import via the `@/*` path alias (`@/lib/db/artworks`, `@/components/homepage/...`), not deep relative paths, outside of files already inside `lib/db/` or `test/setup/` importing their immediate siblings.

## Testing

- Tests are integration tests against a real database — nothing is mocked. `test/setup/global-setup.ts` provisions a fresh Neon branch (migrated) before the run and points `DATABASE_URL`/`DIRECT_URL` at it; the branch is deleted in teardown. See `test/setup/neon-branch.ts` / `test/setup/provision-branch.ts`.
- One branch is shared for the whole `vitest` run, not one per test — write tests so they tolerate other rows existing (filter results down to the ids/rows the test itself created, as in `lib/db/artworks.test.ts`, rather than asserting on exact result-set length unless the test controls the whole set).
- Test files are colocated as `<module>.test.ts` next to the module they cover, using `describe`/`it` with plain-English behavioral descriptions (`"returns visible, featured artworks ordered by featured_at desc..."`), not implementation-detail phrasing.
- Ephemeral test branches follow the `test/run-*` naming convention (`test/setup/neon-branch.ts`); the `.github/workflows/neon-branch-cleanup.yml` scheduled workflow sweeps up any left behind by a killed CI run.

## Formatting & linting

- Prettier (`pnpm format` / `pnpm format:check`) with the `prettier-plugin-tailwindcss` class-sorting plugin — semicolons, double quotes, trailing commas everywhere, matching Prettier's defaults.
- ESLint (`pnpm lint`) via `eslint-config-next`'s `core-web-vitals` + `typescript` flat configs.
- TypeScript `strict` mode — avoid `any`; prefer inferring types from schema/data-access functions (see above) over hand-written duplicate types.
- Run `pnpm lint`, `pnpm format:check`, and `pnpm test` before considering a change done; `pnpm build` provisions its own ephemeral Neon branch in CI (`.github/workflows/ci.yml`) so `build` and `test` can run independently of each other.

## Domain vocabulary

Code, schema, and comments must use the canonical terms defined in `CONTEXT.md`, not synonyms — reviewers should treat a stray synonym as a naming bug, not a style nit. Quick reference (see `CONTEXT.md` for the full definitions):

| Use           | Avoid                                                              |
| ------------- | ------------------------------------------------------------------ |
| Artwork       | Paint, painting, piece, product                                    |
| Featured      | Highlighted, pinned                                                |
| Cart          | Bag, basket                                                        |
| Reservation   | Hold, lock                                                         |
| Order         | Purchase, transaction, sale                                        |
| Customer      | Buyer, user (generic technical use only)                           |
| Subscriber    | Lead, contact                                                      |
| Site Settings | Dashboard (reserve "Dashboard"/"Admin" for the whole private area) |

If a PR introduces a domain concept that isn't in `CONTEXT.md` yet, that's a signal to either use the existing term or flag the gap — not to invent new vocabulary silently.
