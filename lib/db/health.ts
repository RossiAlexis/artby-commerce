import { db } from "./client";
import { healthChecks } from "./schema";

export async function pingDatabase() {
  const [row] = await db.insert(healthChecks).values({}).returning();
  return row;
}
