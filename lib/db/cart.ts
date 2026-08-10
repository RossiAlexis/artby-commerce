"use server";
import { and, asc, eq, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { ArtworkUnavailableError } from "./cart-errors";
import { db } from "./client";
import { artworkPhotos, artworks, cartItems, carts } from "./schema";

const RESERVATION_DURATION_MS = 15 * 60 * 1000;

export async function createCart(customerId?: string) {
  const [cart] = await db.insert(carts).values({ customerId }).returning();
  return cart;
}

/**
 * Reserves the Artwork for 15 minutes and adds it to the Cart. The UPDATE's
 * WHERE clause is the concurrency guard (mirrors the conditional-update
 * pattern from ADR-0003): two simultaneous callers race for the same row,
 * Postgres serializes them, and only the one whose WHERE still matches after
 * the row unlocks succeeds.
 */
export async function addToCart(cartId: string, artworkId: number) {
  const now = new Date();
  const reservedUntil = new Date(now.getTime() + RESERVATION_DURATION_MS);

  await db.transaction(async (tx) => {
    const [reserved] = await tx
      .update(artworks)
      .set({ reservedUntil, reservedByCartId: cartId })
      .where(
        and(
          eq(artworks.id, artworkId),
          eq(artworks.sold, false),
          or(
            isNull(artworks.reservedUntil),
            lt(artworks.reservedUntil, now),
            eq(artworks.reservedByCartId, cartId),
          ),
        ),
      )
      .returning({ id: artworks.id });

    if (!reserved) {
      throw new ArtworkUnavailableError();
    }

    await tx
      .insert(cartItems)
      .values({ cartId, artworkId })
      .onConflictDoNothing();
  });
}

export async function removeFromCart(cartId: string, artworkId: number) {
  await db.transaction(async (tx) => {
    const deleted = await tx
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.artworkId, artworkId)),
      )
      .returning({ id: cartItems.id });

    if (deleted.length === 0) return;

    await tx
      .update(artworks)
      .set({ reservedUntil: null, reservedByCartId: null })
      .where(
        and(eq(artworks.id, artworkId), eq(artworks.reservedByCartId, cartId)),
      );
  });
}

/**
 * Releases any Reservation whose expiry has passed, returning the Artwork to
 * Available (see ADR-0003 — cleanup happens lazily on read, not via a
 * scheduled job) and dropping it from whichever Cart was holding it.
 */
async function releaseExpiredReservations() {
  const now = new Date();
  const expired = await db
    .update(artworks)
    .set({ reservedUntil: null, reservedByCartId: null })
    .where(
      and(
        isNotNull(artworks.reservedByCartId),
        lt(artworks.reservedUntil, now),
      ),
    )
    .returning({ id: artworks.id });

  if (expired.length === 0) return;

  await db.delete(cartItems).where(
    inArray(
      cartItems.artworkId,
      expired.map((artwork) => artwork.id),
    ),
  );
}

export async function getCart(cartId: string) {
  await releaseExpiredReservations();

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
    orderBy: asc(cartItems.id),
    with: {
      artwork: {
        with: {
          photos: {
            where: eq(artworkPhotos.position, 0),
            limit: 1,
          },
        },
      },
    },
  });

  const totalCents = items.reduce(
    (sum, item) => sum + item.artwork.priceCents,
    0,
  );

  return { items, totalCents };
}

export type Cart = Awaited<ReturnType<typeof getCart>>;
export type CartItem = Cart["items"][number];
