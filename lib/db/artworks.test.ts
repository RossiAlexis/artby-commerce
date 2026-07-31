import { describe, expect, it } from "vitest";
import { getFeaturedArtworks } from "./artworks";
import { db } from "./client";
import { artworkPhotos, artworks } from "./schema";

async function insertArtwork(overrides: Partial<typeof artworks.$inferInsert>) {
  const [artwork] = await db
    .insert(artworks)
    .values({
      title: "Untitled",
      description: "A painting.",
      dimensions: "40x40cm",
      medium: "Acrylic on canvas",
      year: 2024,
      priceCents: 45_000,
      ...overrides,
    })
    .returning();
  return artwork;
}

describe("getFeaturedArtworks", () => {
  it("returns visible, featured artworks ordered by featured_at desc with their hero photo, excluding hidden and non-featured ones", async () => {
    const older = await insertArtwork({
      title: "Older featured",
      featured: true,
      featuredAt: new Date("2024-01-01"),
    });
    const newer = await insertArtwork({
      title: "Newer featured",
      featured: true,
      featuredAt: new Date("2024-03-01"),
    });
    const hidden = await insertArtwork({
      title: "Hidden featured",
      featured: true,
      visible: false,
      featuredAt: new Date("2024-02-01"),
    });
    const notFeatured = await insertArtwork({
      title: "Not featured",
      featured: false,
    });

    await db.insert(artworkPhotos).values([
      {
        artworkId: newer.id,
        url: "https://example.com/newer-hero.jpg",
        position: 0,
      },
      {
        artworkId: newer.id,
        url: "https://example.com/newer-second.jpg",
        position: 1,
      },
      {
        artworkId: older.id,
        url: "https://example.com/older-hero.jpg",
        position: 0,
      },
      {
        artworkId: hidden.id,
        url: "https://example.com/hidden-hero.jpg",
        position: 0,
      },
    ]);

    const result = await getFeaturedArtworks(50);
    const relevant = result.filter((artwork) =>
      [older.id, newer.id, hidden.id, notFeatured.id].includes(artwork.id),
    );

    expect(relevant.map((artwork) => artwork.id)).toEqual([newer.id, older.id]);
    expect(relevant[0].photos).toEqual([
      expect.objectContaining({
        url: "https://example.com/newer-hero.jpg",
        position: 0,
      }),
    ]);
  });

  it("limits results to the requested count", async () => {
    for (let i = 0; i < 5; i++) {
      await insertArtwork({
        title: `Limit test ${i}`,
        featured: true,
        featuredAt: new Date(2025, 0, i + 1),
      });
    }

    const result = await getFeaturedArtworks(4);

    expect(result).toHaveLength(4);
  });
});
