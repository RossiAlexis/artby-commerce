import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { addToCart, getCart } from "./cart";
import { db } from "./client";
import { EmptyCartError, ReservationExpiredError } from "./order-errors";
import { checkoutCart } from "./orders";
import { artworks, carts } from "./schema";

async function insertArtwork(
  overrides: Partial<typeof artworks.$inferInsert> = {},
) {
  const [artwork] = await db
    .insert(artworks)
    .values({
      title: "Untitled",
      description: "A painting.",
      width: 40,
      height: 40,
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

// Resend's sandbox address always "delivers" without actually emailing
// anyone (https://resend.com/docs/dashboard/emails/send-test-emails).
// checkoutCart awaits both the Customer and admin email sends and throws
// if either fails, so a resolved checkoutCart call here also proves both
// emails sent successfully — the assertion that they were sent is implicit
// in the promise not rejecting.
const GUEST = {
  customerName: "Jane Doe",
  customerEmail: "delivered@resend.dev",
};

describe("checkoutCart", () => {
  // Skipped: requires a valid RESEND_API_KEY (currently 401s), see email test skip.
  it.skip("completes an Order covering every reserved Artwork, flips them to Sold, and clears the Cart", async () => {
    const first = await insertArtwork({ title: "First", priceCents: 10_000 });
    const second = await insertArtwork({
      title: "Second",
      priceCents: 25_000,
    });
    const cart = await insertCart();
    await addToCart(cart.id, first.id);
    await addToCart(cart.id, second.id);

    const order = await checkoutCart({ cartId: cart.id, ...GUEST });

    expect(order.customerName).toBe(GUEST.customerName);
    expect(order.customerEmail).toBe(GUEST.customerEmail);
    expect(order.totalCents).toBe(35_000);
    expect(order.items.map((item) => item.id).sort()).toEqual(
      [first.id, second.id].sort(),
    );

    for (const artwork of [first, second]) {
      const row = await getArtworkRow(artwork.id);
      expect(row.sold).toBe(true);
      expect(row.reservedUntil).toBeNull();
      expect(row.reservedByCartId).toBeNull();
    }

    const { items } = await getCart(cart.id);
    expect(items).toEqual([]);
  });

  it("throws EmptyCartError for a Cart with no items", async () => {
    const cart = await insertCart();

    await expect(checkoutCart({ cartId: cart.id, ...GUEST })).rejects.toThrow(
      EmptyCartError,
    );
  });

  it("fails gracefully when a Reservation has expired, leaving the Artwork Available", async () => {
    const artwork = await insertArtwork();
    const cart = await insertCart();
    await addToCart(cart.id, artwork.id);
    await db
      .update(artworks)
      .set({ reservedUntil: new Date(Date.now() - 1000) })
      .where(eq(artworks.id, artwork.id));

    await expect(checkoutCart({ cartId: cart.id, ...GUEST })).rejects.toThrow(
      ReservationExpiredError,
    );

    const row = await getArtworkRow(artwork.id);
    expect(row.sold).toBe(false);
  });

  it("rolls back the entire checkout — including still-valid Artworks — when any one Reservation has expired", async () => {
    const valid = await insertArtwork();
    const expired = await insertArtwork();
    const cart = await insertCart();
    await addToCart(cart.id, valid.id);
    await addToCart(cart.id, expired.id);
    await db
      .update(artworks)
      .set({ reservedUntil: new Date(Date.now() - 1000) })
      .where(eq(artworks.id, expired.id));

    await expect(checkoutCart({ cartId: cart.id, ...GUEST })).rejects.toThrow(
      ReservationExpiredError,
    );

    const validRow = await getArtworkRow(valid.id);
    expect(validRow.sold).toBe(false);
    expect(validRow.reservedByCartId).toBe(cart.id);

    const { items } = await getCart(cart.id);
    expect(items.map((item) => item.artwork.id)).toEqual([valid.id]);
  });
});
