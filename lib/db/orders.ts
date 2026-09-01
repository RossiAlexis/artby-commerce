"use server";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { requireEnv } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { OrderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { OrderNotificationEmail } from "@/lib/email/templates/order-notification";
import { db } from "./client";
import {
  artworkPhotos,
  artworks,
  cartItems,
  orderItems,
  orders,
} from "./schema";
import { EmptyCartError, ReservationExpiredError } from "./order-errors";

export type CheckoutInput = {
  cartId: string;
  customerName: string;
  customerEmail: string;
  // Set when the Customer was signed in at checkout time — associates the
  // resulting Order with their account (see CONTEXT.md: Orders are optional
  // to associate, never required, since checkout also supports guests).
  customerId?: string;
  shippingCity: string;
  shippingCountry: string;
  shippingAddress: string;
  isGift: boolean;
  // Only meaningful when isGift is true.
  giftRecipientName?: string;
  giftMessage?: string;
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
  customerId,
  shippingCity,
  shippingCountry,
  shippingAddress,
  isGift,
  giftRecipientName,
  giftMessage,
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
        customerId,
        shippingCity,
        shippingCountry,
        shippingAddress,
        isGift,
        giftRecipientName: isGift ? giftRecipientName : null,
        giftMessage: isGift ? giftMessage : null,
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

  // The Order itself already committed above — a failed confirmation or
  // notification email (e.g. a provider outage) must never turn an
  // otherwise-successful purchase into a checkout error for the Customer.
  await Promise.all([
    sendEmail({
      to: order.customerEmail,
      subject: `Confirmación de tu compra — Orden #${order.id}`,
      template: OrderConfirmationEmail({ order }),
    }).catch((error) => {
      console.error(`Order #${order.id} confirmation email failed:`, error);
    }),
    sendEmail({
      to: requireEnv("ADMIN_EMAIL"),
      subject: `Nueva Orden #${order.id}`,
      template: OrderNotificationEmail({ order }),
    }).catch((error) => {
      console.error(
        `Order #${order.id} admin notification email failed:`,
        error,
      );
    }),
  ]);

  return order;
}

export type CompletedOrder = Awaited<ReturnType<typeof checkoutCart>>;

const orderWithItems = {
  items: {
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
  },
} as const;

/** A signed-in Customer's own past Orders, newest first — see CONTEXT.md. */
export async function getOrdersByCustomer(customerId: string) {
  return db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    orderBy: desc(orders.createdAt),
    with: orderWithItems,
  });
}

export type CustomerOrder = Awaited<
  ReturnType<typeof getOrdersByCustomer>
>[number];

/**
 * A single Order's detail — but only for the Customer it belongs to. This is
 * the access-control enforcement point (see issue #10): an Order placed as a
 * guest, or by a different Customer, resolves to `null` here exactly like a
 * not-found Order, rather than leaking whether the id exists at all.
 */
export async function getOrderById(id: number, customerId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: orderWithItems,
  });

  if (!order || order.customerId !== customerId) {
    return null;
  }

  return order;
}

export type CustomerOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderById>>
>;
