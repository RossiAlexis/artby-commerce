"use server";
import { desc } from "drizzle-orm";
import { db } from "./client";
import { siteSettings } from "./schema";

export async function getSiteSettings() {
  const [settings] = await db
    .select()
    .from(siteSettings)
    .orderBy(desc(siteSettings.id))
    .limit(1);
  return settings;
}
