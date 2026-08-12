"use server";
import { and, eq, gt, inArray } from "drizzle-orm";
import { requireEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { OrderNotificationEmail } from "@/lib/email/templates/order-notification";
import { db } from "./client";
import { artworks, cartItems, orderItems, orders } from "./schema";
import { EmptyCartError, ReservationExpiredError } from "./order-errors";

export type CheckoutInput = {
  cartId: string;
  customerName: string;
  customerEmail: string;
};

/**
 * Completes an Order for every Artwork in the Cart, as one atomic
 * transaction: it only commits if every covered Artwork's 15-minute
 * Reservation (see ADR-0003) is still held by this Cart at the moment of
 * checkout. Any one expired Reservation rolls the whole checkout back,
 * rather than silently completing a partial Order.
 */
export async function checkoutCart({
  cartId,
  customerName,
  customerEmail,
}: CheckoutInput) {
  const now = new Date();

  const order = await db.transaction(async (tx) => {
    const items = await tx
      .select({ artworkId: cartItems.artworkId })
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      throw new EmptyCartError();
    }

    const artworkIds = items.map((item) => item.artworkId);

    const sold = await tx
      .update(artworks)
      .set({ sold: true, reservedUntil: null, reservedByCartId: null })
      .where(
        and(
          inArray(artworks.id, artworkIds),
          eq(artworks.sold, false),
          eq(artworks.reservedByCartId, cartId),
          gt(artworks.reservedUntil, now),
        ),
      )
      .returning({
        id: artworks.id,
        title: artworks.title,
        priceCents: artworks.priceCents,
        currency: artworks.currency,
      });

    if (sold.length !== artworkIds.length) {
      throw new ReservationExpiredError();
    }

    const totalCents = sold.reduce(
      (sum, artwork) => sum + artwork.priceCents,
      0,
    );

    const [order] = await tx
      .insert(orders)
      .values({
        customerName,
        customerEmail,
        totalCents,
        currency: sold[0].currency,
      })
      .returning();

    await tx.insert(orderItems).values(
      sold.map((artwork) => ({
        orderId: order.id,
        artworkId: artwork.id,
        priceCents: artwork.priceCents,
      })),
    );

    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return { ...order, items: sold };
  });

  await Promise.all([
    sendEmail({
      to: order.customerEmail,
      subject: `Confirmación de tu compra — Orden #${order.id}`,
      template: OrderConfirmationEmail({ order }),
    }),
    sendEmail({
      to: requireEnv("ADMIN_EMAIL"),
      subject: `Nueva Orden #${order.id}`,
      template: OrderNotificationEmail({ order }),
    }),
  ]);

  return order;
}

export type CompletedOrder = Awaited<ReturnType<typeof checkoutCart>>;
