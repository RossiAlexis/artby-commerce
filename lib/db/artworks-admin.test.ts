import { asc, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  ArtworkPhotoMismatchError,
  ArtworkReferencedByOrderError,
} from "./artwork-errors";
import {
  createArtwork,
  deleteArtwork,
  getAdminArtworkById,
  getAdminArtworks,
  reorderArtworkPhotos,
  setArtworkFlags,
  updateArtwork,
} from "./artworks-admin";
import { db } from "./client";
import { artworkPhotos, artworks, orderItems, orders } from "./schema";

async function insertArtwork(
  overrides: Partial<typeof artworks.$inferInsert> = {},
) {
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

const FIELDS = {
  title: "Amanecer",
  description: "A sunrise over the hills.",
  dimensions: "50x60 cm",
  medium: "Acrylic on canvas",
  year: 2025,
  priceCents: 60_000,
};

describe("createArtwork", () => {
  it("creates an Artwork, defaulting to unsold, visible, and not featured", async () => {
    const artwork = await createArtwork(FIELDS);

    expect(artwork).toMatchObject(FIELDS);
    expect(artwork.sold).toBe(false);
    expect(artwork.visible).toBe(true);
    expect(artwork.featured).toBe(false);
  });
});

describe("updateArtwork", () => {
  it("updates an Artwork's editable fields", async () => {
    const artwork = await insertArtwork();

    const updated = await updateArtwork(artwork.id, {
      ...FIELDS,
      title: "Renamed",
    });

    expect(updated.title).toBe("Renamed");
    expect(updated.dimensions).toBe(FIELDS.dimensions);
  });
});

describe("setArtworkFlags", () => {
  it("independently sets Sold, Visibility, and Featured", async () => {
    const artwork = await insertArtwork();

    const soldOnly = await setArtworkFlags(artwork.id, { sold: true });
    expect(soldOnly.sold).toBe(true);
    expect(soldOnly.visible).toBe(true);
    expect(soldOnly.featured).toBe(false);

    const hiddenToo = await setArtworkFlags(artwork.id, { visible: false });
    expect(hiddenToo.sold).toBe(true);
    expect(hiddenToo.visible).toBe(false);
  });

  it("bumps featuredAt when Featured is turned on", async () => {
    const artwork = await insertArtwork();

    const featured = await setArtworkFlags(artwork.id, { featured: true });

    expect(featured.featured).toBe(true);
    expect(featured.featuredAt).not.toBeNull();
  });
});

describe("getAdminArtworks / getAdminArtworkById", () => {
  it("includes hidden and sold Artworks, unlike the public listing", async () => {
    const hidden = await insertArtwork({ title: "Hidden", visible: false });
    const sold = await insertArtwork({ title: "Sold", sold: true });

    const list = await getAdminArtworks();
    const ids = list.map((artwork) => artwork.id);
    expect(ids).toContain(hidden.id);
    expect(ids).toContain(sold.id);

    const found = await getAdminArtworkById(hidden.id);
    expect(found?.id).toBe(hidden.id);
  });

  it("returns undefined for a missing id", async () => {
    const found = await getAdminArtworkById(-1);
    expect(found).toBeUndefined();
  });
});

describe("deleteArtwork", () => {
  it("deletes an Artwork that has never been referenced by an Order", async () => {
    const artwork = await insertArtwork();

    const deleted = await deleteArtwork(artwork.id);

    expect(deleted.id).toBe(artwork.id);
    const found = await getAdminArtworkById(artwork.id);
    expect(found).toBeUndefined();
  });

  it("throws ArtworkReferencedByOrderError and leaves the Artwork intact when an Order references it", async () => {
    const artwork = await insertArtwork();
    const [order] = await db
      .insert(orders)
      .values({
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        totalCents: artwork.priceCents,
      })
      .returning();
    await db.insert(orderItems).values({
      orderId: order.id,
      artworkId: artwork.id,
      priceCents: artwork.priceCents,
    });

    await expect(deleteArtwork(artwork.id)).rejects.toThrow(
      ArtworkReferencedByOrderError,
    );

    const found = await getAdminArtworkById(artwork.id);
    expect(found).not.toBeUndefined();
  });
});

describe("reorderArtworkPhotos", () => {
  it("updates each photo's position to match the given order", async () => {
    const artwork = await insertArtwork();
    const [first, second, third] = await db
      .insert(artworkPhotos)
      .values([
        {
          artworkId: artwork.id,
          url: "https://example.com/1.jpg",
          position: 0,
        },
        {
          artworkId: artwork.id,
          url: "https://example.com/2.jpg",
          position: 1,
        },
        {
          artworkId: artwork.id,
          url: "https://example.com/3.jpg",
          position: 2,
        },
      ])
      .returning();

    await reorderArtworkPhotos(artwork.id, [third.id, first.id, second.id]);

    const reordered = await db
      .select()
      .from(artworkPhotos)
      .where(eq(artworkPhotos.artworkId, artwork.id))
      .orderBy(asc(artworkPhotos.position));

    expect(reordered.map((photo) => photo.id)).toEqual([
      third.id,
      first.id,
      second.id,
    ]);
    expect(reordered.map((photo) => photo.position)).toEqual([0, 1, 2]);
  });

  it("throws ArtworkPhotoMismatchError when the ids don't match the Artwork's current photos", async () => {
    const artwork = await insertArtwork();
    const [photo] = await db
      .insert(artworkPhotos)
      .values({
        artworkId: artwork.id,
        url: "https://example.com/1.jpg",
        position: 0,
      })
      .returning();

    await expect(
      reorderArtworkPhotos(artwork.id, [photo.id, -1]),
    ).rejects.toThrow(ArtworkPhotoMismatchError);
  });
});
