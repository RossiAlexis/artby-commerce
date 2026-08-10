import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { addToCart, getCart, removeFromCart } from "./cart";
import { ArtworkUnavailableError } from "./cart-errors";
import { db } from "./client";
import { artworks, carts } from "./schema";

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

async function insertCart() {
  const [cart] = await db.insert(carts).values({}).returning();
  return cart;
}

async function getArtworkRow(id: number) {
  const [row] = await db.select().from(artworks).where(eq(artworks.id, id));
  return row;
}

describe("addToCart", () => {
  it("creates a 15-minute Reservation on the Artwork and adds it to the Cart", async () => {
    const artwork = await insertArtwork();
    const cart = await insertCart();
    const before = Date.now();

    await addToCart(cart.id, artwork.id);

    const reserved = await getArtworkRow(artwork.id);
    expect(reserved.reservedByCartId).toBe(cart.id);
    const expiryMs = reserved.reservedUntil?.getTime() ?? 0;
    expect(expiryMs).toBeGreaterThan(before + 14 * 60 * 1000);
    expect(expiryMs).toBeLessThan(before + 16 * 60 * 1000);

    const { items } = await getCart(cart.id);
    expect(items.map((item) => item.artwork.id)).toEqual([artwork.id]);
  });

  it("rejects adding an already-sold Artwork", async () => {
    const artwork = await insertArtwork({ sold: true });
    const cart = await insertCart();

    await expect(addToCart(cart.id, artwork.id)).rejects.toThrow(
      ArtworkUnavailableError,
    );
  });

  it("rejects adding an Artwork already reserved by another Cart", async () => {
    const artwork = await insertArtwork();
    const firstCart = await insertCart();
    const secondCart = await insertCart();

    await addToCart(firstCart.id, artwork.id);

    await expect(addToCart(secondCart.id, artwork.id)).rejects.toThrow(
      ArtworkUnavailableError,
    );
  });

  it("is idempotent when the same Cart adds the same Artwork twice", async () => {
    const artwork = await insertArtwork();
    const cart = await insertCart();

    await addToCart(cart.id, artwork.id);
    await addToCart(cart.id, artwork.id);

    const { items } = await getCart(cart.id);
    expect(items.map((item) => item.artwork.id)).toEqual([artwork.id]);
  });

  it("allows reserving an Artwork again once its prior Reservation has expired", async () => {
    const artwork = await insertArtwork();
    const firstCart = await insertCart();
    const secondCart = await insertCart();

    await addToCart(firstCart.id, artwork.id);
    await db
      .update(artworks)
      .set({ reservedUntil: new Date(Date.now() - 1000) })
      .where(eq(artworks.id, artwork.id));

    await addToCart(secondCart.id, artwork.id);

    const reserved = await getArtworkRow(artwork.id);
    expect(reserved.reservedByCartId).toBe(secondCart.id);
  });

  it("allows exactly one of two concurrent Reservation attempts on the same Artwork to succeed", async () => {
    const artwork = await insertArtwork();
    const cartA = await insertCart();
    const cartB = await insertCart();

    const results = await Promise.allSettled([
      addToCart(cartA.id, artwork.id),
      addToCart(cartB.id, artwork.id),
    ]);

    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
  });
});

describe("removeFromCart", () => {
  it("removes the item from the Cart and releases the Artwork's Reservation", async () => {
    const artwork = await insertArtwork();
    const cart = await insertCart();
    await addToCart(cart.id, artwork.id);

    await removeFromCart(cart.id, artwork.id);

    const { items } = await getCart(cart.id);
    expect(items).toEqual([]);
    const row = await getArtworkRow(artwork.id);
    expect(row.reservedUntil).toBeNull();
    expect(row.reservedByCartId).toBeNull();
  });
});

describe("getCart", () => {
  it("returns held Artworks with hero photo, dimensions/medium and price, plus a running total", async () => {
    const first = await insertArtwork({
      title: "First",
      dimensions: "30x30cm",
      medium: "Oil on canvas",
      priceCents: 10_000,
    });
    const second = await insertArtwork({
      title: "Second",
      dimensions: "50x50cm",
      medium: "Watercolor",
      priceCents: 25_000,
    });
    const cart = await insertCart();
    await addToCart(cart.id, first.id);
    await addToCart(cart.id, second.id);

    const { items, totalCents } = await getCart(cart.id);

    expect(items.map((item) => item.artwork.title).sort()).toEqual([
      "First",
      "Second",
    ]);
    expect(totalCents).toBe(35_000);
  });

  it("automatically returns an expired Reservation's Artwork to Available and drops it from the Cart", async () => {
    const artwork = await insertArtwork();
    const cart = await insertCart();
    await addToCart(cart.id, artwork.id);
    await db
      .update(artworks)
      .set({ reservedUntil: new Date(Date.now() - 1000) })
      .where(eq(artworks.id, artwork.id));

    const { items } = await getCart(cart.id);

    expect(items).toEqual([]);
    const row = await getArtworkRow(artwork.id);
    expect(row.sold).toBe(false);
    expect(row.reservedUntil).toBeNull();
    expect(row.reservedByCartId).toBeNull();
  });
});
