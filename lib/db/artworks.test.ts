import { describe, expect, it } from "vitest";
import { getArtworks, getFeaturedArtworks } from "./artworks";
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

describe("getArtworks", () => {
  it("returns only visible, available (unsold) artworks for the 'available' filter", async () => {
    const available = await insertArtwork({ title: "Available" });
    const sold = await insertArtwork({ title: "Sold", sold: true });
    const hidden = await insertArtwork({ title: "Hidden", visible: false });

    const { artworks: result } = await getArtworks("available");
    const relevant = result.filter((artwork) =>
      [available.id, sold.id, hidden.id].includes(artwork.id),
    );

    expect(relevant.map((artwork) => artwork.id)).toEqual([available.id]);
  });

  it("returns only visible, sold artworks for the 'sold' filter", async () => {
    const available = await insertArtwork({ title: "Available" });
    const sold = await insertArtwork({ title: "Sold", sold: true });
    const hiddenSold = await insertArtwork({
      title: "Hidden sold",
      sold: true,
      visible: false,
    });

    const { artworks: result } = await getArtworks("sold");
    const relevant = result.filter((artwork) =>
      [available.id, sold.id, hiddenSold.id].includes(artwork.id),
    );

    expect(relevant.map((artwork) => artwork.id)).toEqual([sold.id]);
  });

  it("returns all visible artworks regardless of sold status for the 'all' filter", async () => {
    const available = await insertArtwork({ title: "Available" });
    const sold = await insertArtwork({ title: "Sold", sold: true });
    const hidden = await insertArtwork({ title: "Hidden", visible: false });

    const { artworks: result } = await getArtworks("all", { pageSize: 1000 });
    const relevant = result.filter((artwork) =>
      [available.id, sold.id, hidden.id].includes(artwork.id),
    );

    expect(relevant.map((artwork) => artwork.id).sort((a, b) => a - b)).toEqual(
      [available.id, sold.id].sort((a, b) => a - b),
    );
  });

  it("includes the hero photo for each artwork", async () => {
    const artwork = await insertArtwork({ title: "With photo" });
    await db.insert(artworkPhotos).values([
      {
        artworkId: artwork.id,
        url: "https://example.com/hero.jpg",
        position: 0,
      },
      {
        artworkId: artwork.id,
        url: "https://example.com/second.jpg",
        position: 1,
      },
    ]);

    const { artworks: result } = await getArtworks("all", { pageSize: 1000 });
    const found = result.find((item) => item.id === artwork.id);

    expect(found?.photos).toEqual([
      expect.objectContaining({
        url: "https://example.com/hero.jpg",
        position: 0,
      }),
    ]);
  });

  it("paginates results and reports whether more pages remain", async () => {
    const inserted = [];
    for (let i = 0; i < 5; i++) {
      inserted.push(await insertArtwork({ title: `Page test ${i}` }));
    }
    // Newest ids sort first, so this test's own rows always land on the
    // earliest pages regardless of what earlier tests already inserted.
    const insertedIds = inserted.map((artwork) => artwork.id).reverse();

    const firstPage = await getArtworks("all", { page: 1, pageSize: 5 });
    const firstPageIds = firstPage.artworks.map((artwork) => artwork.id);
    expect(firstPageIds.every((id) => insertedIds.includes(id))).toBe(true);
    expect(firstPage.hasMore).toBe(true);

    const secondPage = await getArtworks("all", { page: 2, pageSize: 5 });
    const secondPageIds = secondPage.artworks.map((artwork) => artwork.id);
    expect(secondPageIds.some((id) => insertedIds.includes(id))).toBe(false);
  });
});
