import { config } from "dotenv";
import { deleteTestBranch } from "./neon-branch";
import { provisionMigratedBranch } from "./provision-branch";

config({ path: ".env.local" });

export default async function setup() {
  const branch = await provisionMigratedBranch();

  process.env.DATABASE_URL = branch.databaseUrl;
  process.env.DIRECT_URL = branch.directUrl;

  return async () => {
    await deleteTestBranch(branch.branchId);
  };
}
