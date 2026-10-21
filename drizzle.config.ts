import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Only required for commands that connect (migrate/push/studio) — `generate`
// just diffs the local schema against local migration snapshots.
//
// Migrate the same database the app will query. A preview build's DATABASE_URL
// points at that preview's Neon branch, while DIRECT_URL may still be a shared
// development or production URL. Using the mismatched URL would skip the
// preview schema (and could migrate the wrong branch).
function hostOf(connectionString: string) {
  try {
    return new URL(connectionString).hostname.replace("-pooler", "");
  } catch {
    return "";
  }
}

function unpooled(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.hostname = url.hostname.replace("-pooler", "");
    return url.toString();
  } catch {
    return connectionString;
  }
}

function migrationUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  const directCandidates = [
    process.env.DIRECT_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter((value): value is string => Boolean(value));

  if (!databaseUrl) return directCandidates[0] ?? "";

  const appHost = hostOf(databaseUrl);
  const matchingDirect = directCandidates.find(
    (candidate) => hostOf(candidate) === appHost,
  );
  return matchingDirect ?? unpooled(databaseUrl);
}

const directUrl = migrationUrl();

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: directUrl,
  },
});
