import { appendFileSync } from "node:fs";
import { provisionMigratedBranch } from "../../test/setup/provision-branch";

async function main() {
  const githubEnv = process.env.GITHUB_ENV;
  if (!githubEnv) {
    throw new Error("GITHUB_ENV is not set");
  }

  const branch = await provisionMigratedBranch();

  appendFileSync(
    githubEnv,
    `DATABASE_URL=${branch.databaseUrl}\nDIRECT_URL=${branch.directUrl}\nNEON_BUILD_BRANCH_ID=${branch.branchId}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
