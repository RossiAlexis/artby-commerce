import { type ChildProcess, spawn } from "node:child_process";
import { config } from "dotenv";
import { deleteTestBranch } from "../../test/setup/neon-branch";
import { provisionMigratedBranch } from "../../test/setup/provision-branch";
import { seedTestData } from "./seed";

config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";

async function waitForServer(url: string, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // Server not accepting connections yet — keep polling.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `Dev server at ${url} did not become ready in ${timeoutMs}ms`,
  );
}

/**
 * Playwright's `webServer` config option can't be used here — it starts
 * before this file's env changes would exist, so `next dev` would boot
 * against whatever DATABASE_URL is already in `.env.local` instead of this
 * run's ephemeral Neon branch. Owning the whole lifecycle (provision → seed
 * → spawn → wait → return teardown) in one sequential globalSetup avoids
 * that race entirely — mirrors `test/setup/global-setup.ts`'s vitest
 * equivalent, plus the extra step of spawning the app itself.
 */
export default async function globalSetup() {
  const branch = await provisionMigratedBranch();
  await seedTestData(branch.databaseUrl);

  // Variables already present in process.env take precedence over
  // `.env.local` in Next's own env loading, so this is enough to point the
  // spawned dev server at the ephemeral branch without touching the file.
  const serverProcess: ChildProcess = spawn("pnpm", ["exec", "next", "dev"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: branch.databaseUrl,
      DIRECT_URL: branch.directUrl,
    },
    stdio: "inherit",
  });

  try {
    await waitForServer(BASE_URL, 60_000);
  } catch (error) {
    serverProcess.kill();
    await deleteTestBranch(branch.branchId);
    throw error;
  }

  return async () => {
    serverProcess.kill();
    await deleteTestBranch(branch.branchId);
  };
}
