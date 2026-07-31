import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Only required for commands that connect (migrate/push/studio) — `generate`
// just diffs the local schema against local migration snapshots.
const directUrl = process.env.DIRECT_URL ?? "";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
});
