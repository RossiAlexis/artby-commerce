import { describe, expect, it } from "vitest";
import { count } from "drizzle-orm";
import { getSiteSettings, updateSiteSettings } from "./site-settings";
import { db } from "./client";
import { siteSettings } from "./schema";

const BASE_FIELDS = {
  coverImageUrl: "/seed/cover.png",
  heroTagline: "Pinturas acrílicas para el lugar que las estaba esperando.",
  aboutImageUrl: "/seed/about-artist-image.png",
  aboutTitle: "Vero Miller",
  aboutDescription: "El arte no fue una elección.",
  socialLinks: { instagram: "https://instagram.com/artbyveromiller" },
  contactInfo: { email: "hola@artbyveromiller.com" },
};

describe("getSiteSettings", () => {
  it("returns the current site settings row", async () => {
    const [inserted] = await db
      .insert(siteSettings)
      .values(BASE_FIELDS)
      .returning();

    const settings = await getSiteSettings();

    expect(settings?.id).toBe(inserted.id);
    expect(settings?.heroTagline).toBe(inserted.heroTagline);
    expect(settings?.socialLinks).toEqual(inserted.socialLinks);
  });
});

describe("updateSiteSettings", () => {
  it("always targets the singleton row — never creates a second", async () => {
    const [{ value: countBefore }] = await db
      .select({ value: count() })
      .from(siteSettings);

    const [inserted] = await db
      .insert(siteSettings)
      .values(BASE_FIELDS)
      .returning();

    const updated = await updateSiteSettings({
      heroTagline: "Nueva frase principal.",
      announcementBar: "Envío internacional incluido",
    });

    expect(updated.id).toBe(inserted.id);
    expect(updated.heroTagline).toBe("Nueva frase principal.");
    expect(updated.announcementBar).toBe("Envío internacional incluido");

    // The update must have landed on `inserted`'s own row, not a new one —
    // the table should have grown by exactly the one row we just inserted.
    const [{ value: countAfter }] = await db
      .select({ value: count() })
      .from(siteSettings);
    expect(countAfter).toBe(countBefore + 1);
  });
});
