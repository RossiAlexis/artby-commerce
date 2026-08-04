import { describe, expect, it } from "vitest";
import { getSiteSettings } from "./site-settings";
import { db } from "./client";
import { siteSettings } from "./schema";

describe("getSiteSettings", () => {
  it("returns the current site settings row", async () => {
    const [inserted] = await db
      .insert(siteSettings)
      .values({
        coverImageUrl: "/seed/cover.png",
        heroTagline:
          "Pinturas acrílicas para el lugar que las estaba esperando.",
        aboutImageUrl: "/seed/about-artist-image.png",
        aboutTitle: "Vero Miller",
        aboutDescription: "El arte no fue una elección.",
        socialLinks: { instagram: "https://instagram.com/artbyveromiller" },
        contactInfo: { email: "hola@artbyveromiller.com" },
      })
      .returning();

    const settings = await getSiteSettings();

    expect(settings?.id).toBe(inserted.id);
    expect(settings?.heroTagline).toBe(inserted.heroTagline);
    expect(settings?.socialLinks).toEqual(inserted.socialLinks);
  });
});
