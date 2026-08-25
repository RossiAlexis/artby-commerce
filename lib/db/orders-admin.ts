"use server";
import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { orders } from "./schema";

/**
 * All Orders, newest first, for the admin Orders list — each Order includes
 * its Order Items with the covered Artwork's title, enough to show buyer,
 * Artwork(s), amount, and date without a per-row extra fetch.
 */
export async function getAdminOrders() {
  return db.query.orders.findMany({
    orderBy: desc(orders.id),
    with: {
      items: {
        with: {
          artwork: {
            columns: { id: true, title: true },
          },
        },
      },
    },
  });
}

export type AdminOrderListItem = Awaited<
  ReturnType<typeof getAdminOrders>
>[number];

/**
 * A single Order, with every Artwork it covers (title + snapshot price), for
 * the admin Order detail view.
 */
export async function getAdminOrderById(id: number) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: {
        with: {
          artwork: {
            columns: { id: true, title: true },
          },
        },
      },
    },
  });
}

export type AdminOrderDetail = Awaited<ReturnType<typeof getAdminOrderById>>;
