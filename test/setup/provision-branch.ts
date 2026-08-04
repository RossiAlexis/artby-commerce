import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";
import { createTestBranch, type TestBranch } from "./neon-branch";

neonConfig.webSocketConstructor = ws;

// Branches inherit the parent's data, but not necessarily its migration
// state, so every branch gets migrated regardless of what the parent has.
export async function provisionMigratedBranch(): Promise<TestBranch> {
  const branch = await createTestBranch();

  const migrationPool = new Pool({ connectionString: branch.directUrl });
  const migrationDb = drizzle(migrationPool);
  await migrate(migrationDb, { migrationsFolder: "./drizzle" });
  await migrationPool.end();

  return branch;
}
