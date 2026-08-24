"use server";
import { desc, eq } from "drizzle-orm";
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

export type SiteSettings = NonNullable<
  Awaited<ReturnType<typeof getSiteSettings>>
>;

export type SiteSettingsUpdate = Partial<{
  coverImageUrl: string;
  heroTagline: string;
  announcementBar: string | null;
  aboutImageUrl: string;
  aboutTitle: string;
  aboutDescription: string;
  postPurchaseMessage: string | null;
  socialLinks: Record<string, string>;
  contactInfo: Record<string, string>;
}>;

/**
 * Always updates the existing Site Settings row by its own id — never
 * inserts, so a second row can never appear (see CONTEXT.md's Site Settings
 * entry). Assumes a row already exists, seeded ahead of time.
 */
export async function updateSiteSettings(fields: SiteSettingsUpdate) {
  const existing = await getSiteSettings();
  if (!existing) {
    throw new Error(
      "No Site Settings row exists yet — seed the database before editing it.",
    );
  }

  const [updated] = await db
    .update(siteSettings)
    .set(fields)
    .where(eq(siteSettings.id, existing.id))
    .returning();
  return updated;
}
