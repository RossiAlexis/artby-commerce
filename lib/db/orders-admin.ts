"use server";
import { count, desc, eq } from "drizzle-orm";
import { requireAdminAction } from "@/lib/auth/require-admin";
import { db } from "./client";
import type { OrdersFilter } from "./orders-filter";
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

export type OrderStatus = "paid" | "shipped" | "delivered";

/**
 * Orders for the admin Orders list, newest first — each Order includes its
 * Order Items with the covered Artwork's title, enough to show Customer,
 * Artwork(s), amount, and date without a per-row extra fetch. "active"
 * excludes archived (delivered-and-filed-away) Orders; "archived" is only
 * those.
 */
export async function getAdminOrders(filter: OrdersFilter = "active") {
  await requireAdminAction();
  return db.query.orders.findMany({
    where: eq(orders.archived, filter === "archived"),
    orderBy: desc(orders.id),
    with: orderWithItemTitles,
  });
}

export type AdminOrderListItem = Awaited<
  ReturnType<typeof getAdminOrders>
>[number];

/** Counts backing the "Activos (N)" / "Archivados" Pedidos tabs. */
export async function getAdminOrderCounts() {
  await requireAdminAction();
  const rows = await db
    .select({ archived: orders.archived, count: count() })
    .from(orders)
    .groupBy(orders.archived);
  return {
    active: rows.find((row) => !row.archived)?.count ?? 0,
    archived: rows.find((row) => row.archived)?.count ?? 0,
  };
}

const NEXT_STATUS = {
  paid: "shipped",
  shipped: "delivered",
} as const;

/** Advances an Order one step through paid -> shipped -> delivered. */
export async function advanceOrderStatus(id: number) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return null;
  const next = NEXT_STATUS[order.status as keyof typeof NEXT_STATUS];
  if (!next) return order;
  const [updated] = await db
    .update(orders)
    .set({ status: next })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

/** Only meaningful once an Order is "delivered" — enforced by the caller. */
export async function archiveOrder(id: number) {
  const [updated] = await db
    .update(orders)
    .set({ archived: true })
    .where(eq(orders.id, id))
    .returning();
  return updated;
}

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
