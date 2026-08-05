import { deleteTestBranch, listBranches } from "../../test/setup/neon-branch";

const STALE_BRANCH_PREFIX = "test/run-";
const DEFAULT_MAX_AGE_HOURS = 3;

function maxAgeHours(): number {
  const raw = process.env.STALE_BRANCH_MAX_AGE_HOURS;
  if (!raw) return DEFAULT_MAX_AGE_HOURS;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid STALE_BRANCH_MAX_AGE_HOURS: ${raw}`);
  }
  return parsed;
}

async function main() {
  const cutoff = Date.now() - maxAgeHours() * 60 * 60 * 1000;
  const branches = await listBranches();
  const stale = branches.filter(
    (branch) =>
      branch.name.startsWith(STALE_BRANCH_PREFIX) &&
      new Date(branch.createdAt).getTime() < cutoff,
  );

  if (stale.length === 0) {
    console.log("No stale test branches found.");
    return;
  }

  for (const branch of stale) {
    console.log(
      `Deleting stale branch ${branch.name} (${branch.id}, created ${branch.createdAt})`,
    );
    await deleteTestBranch(branch.id);
  }

  console.log(`Deleted ${stale.length} stale branch(es).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
