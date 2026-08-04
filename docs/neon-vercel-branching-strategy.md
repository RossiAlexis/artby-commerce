# Neon + Vercel branching strategy

How database branches map to environments, and what happens to data isolation
as code moves from a local feature branch through a PR/preview to `main`.

## 1. Branch topology

```mermaid
flowchart TD
    subgraph Neon["Neon Project: artby-commerce"]
        prod[("production<br/>real customer data")]
        dev[("development<br/>persistent, shared, seeded dev data")]
        pr12[("preview/pr-12<br/>ephemeral")]
        pr13[("preview/pr-13<br/>ephemeral")]
    end

    subgraph Vercel["Vercel environments"]
        vprod["Production"]
        vdev["Development<br/>(+ local .env.local)"]
        vprev["Preview<br/>(one per PR)"]
    end

    prod -.branched from.-> pr12
    prod -.branched from.-> pr13

    prod --> vprod
    dev --> vdev
    pr12 --> vprev
    pr13 --> vprev
```

Three tiers, three purposes: `production` is sacred, `development` is the
everyday shared sandbox, and `preview/*` branches are throwaway and scoped to
a single PR's lifetime.

## 2. Lifecycle: dev → PR → preview → merge

```mermaid
sequenceDiagram
    actor You
    participant GitHub
    participant Vercel
    participant Neon

    Note over You,Neon: Local dev — you work against the "development" branch (.env.local)

    You->>GitHub: git push feature/x
    GitHub->>Vercel: new commit webhook
    Vercel->>Neon: create branch "preview/pr-12" (from production)
    Neon-->>Vercel: DATABASE_URL for this preview
    Vercel-->>GitHub: preview URL posted
    You->>GitHub: open PR (MR)

    You->>Vercel: click preview URL
    Vercel-->>You: serves preview build, wired to preview/pr-12 only

    You->>GitHub: merge PR to main
    GitHub->>Vercel: merge webhook
    Vercel->>Neon: deploy Production (uses "production" branch)
    Vercel->>Neon: delete branch "preview/pr-12"
```

Key points:

- Every PR gets its own isolated copy of the data (schema + snapshot), so a
  reviewer testing destructive changes on a preview can't corrupt prod or the
  shared dev branch.
- The preview branch is deleted automatically the moment Vercel tears down
  that preview deployment (PR closed or merged) — no manual cleanup, no
  orphaned branches piling up in the Neon dashboard.
- Production is only ever touched by the Production deployment, never by a
  preview build.

## 3. Open question: migrations

Neither integration runs `drizzle-kit migrate` for you — that's still
something to trigger explicitly. Two common approaches:

- Run it as part of the Vercel build command for that environment (e.g.
  `pnpm db:migrate && next build`), so each preview build migrates its own
  fresh branch, and the production build migrates the production branch on
  deploy.
- Run it as a separate CI step (GitHub Actions) before/alongside the Vercel
  deploy.

Wiring it into the build command is probably the least-friction option given
migrations are already run manually via `pnpm db:migrate`, but a botched
migration in a build step blocks deploys — worth deciding deliberately rather
than defaulting into it.

## 4. How the existing test harness fits in

Unrelated to all of the above — `test/setup/global-setup.ts`'s ephemeral
branch-per-test-run is a separate, third lifecycle purely for `pnpm test`
(local or CI), independent of Vercel previews. Nothing needs to change there.
