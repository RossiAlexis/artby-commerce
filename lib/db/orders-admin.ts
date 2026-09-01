"use server";
import { desc, eq } from "drizzle-orm";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { db } from "./client";
import { orders } from "./schema";

const orderWithItemTitles = {
  items: {
    with: {
      artwork: {
        columns: { id: true, title: true },
      },
    },
  },
} as const;

/**
 * All Orders, newest first, for the admin Orders list — each Order includes
 * its Order Items with the covered Artwork's title, enough to show Customer,
 * Artwork(s), amount, and date without a per-row extra fetch.
 */
export async function getAdminOrders() {
  await requireAdminAction();
  return db.query.orders.findMany({
    orderBy: desc(orders.id),
    with: orderWithItemTitles,
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
  await requireAdminAction();
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: orderWithItemTitles,
  });
}

export type AdminOrderDetail = Awaited<ReturnType<typeof getAdminOrderById>>;
