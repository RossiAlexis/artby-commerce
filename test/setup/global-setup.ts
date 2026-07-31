import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";
import { createTestBranch, deleteTestBranch } from "./neon-branch";

config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

export default async function setup() {
  const branch = await createTestBranch();

  const migrationPool = new Pool({ connectionString: branch.directUrl });
  const migrationDb = drizzle(migrationPool);
  await migrate(migrationDb, { migrationsFolder: "./drizzle" });
  await migrationPool.end();

  process.env.DATABASE_URL = branch.databaseUrl;
  process.env.DIRECT_URL = branch.directUrl;

  return async () => {
    await deleteTestBranch(branch.branchId);
  };
}
