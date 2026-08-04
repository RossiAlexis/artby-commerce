import { deleteTestBranch } from "../../test/setup/neon-branch";

async function main() {
  const branchId = process.env.NEON_BUILD_BRANCH_ID;
  if (!branchId) {
    throw new Error("NEON_BUILD_BRANCH_ID is not set");
  }

  await deleteTestBranch(branchId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
