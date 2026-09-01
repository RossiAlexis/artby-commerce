import { describe, expect, it, vi } from "vitest";
import { db } from "./client";
import { getAdminOrderById, getAdminOrders } from "./orders-admin";
import { artworks, orderItems, orders } from "./schema";

// getAdminOrders/getAdminOrderById require an admin session — stand in for
// the real Auth.js session lookup, which needs a request context this
// unit test has none of.
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { isAdmin: true } }),
}));

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

async function insertOrder(
  overrides: Partial<typeof orders.$inferInsert> = {},
) {
  const [order] = await db
    .insert(orders)
    .values({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      totalCents: 45_000,
      currency: "USD",
      ...overrides,
    })
    .returning();
  return order;
}

async function insertOrderItem(
  orderId: number,
  artworkId: number,
  priceCents: number,
) {
  const [item] = await db
    .insert(orderItems)
    .values({ orderId, artworkId, priceCents })
    .returning();
  return item;
}

describe("getAdminOrders", () => {
  it("lists every Order, newest first, with Customer, Artwork(s), amount, and date", async () => {
    const first = await insertArtwork({ title: "First", priceCents: 10_000 });
    const older = await insertOrder({
      customerName: "Older Customer",
      customerEmail: "older@example.com",
      totalCents: 10_000,
    });
    await insertOrderItem(older.id, first.id, 10_000);

    const second = await insertArtwork({ title: "Second", priceCents: 25_000 });
    const third = await insertArtwork({ title: "Third", priceCents: 15_000 });
    const newer = await insertOrder({
      customerName: "Newer Customer",
      customerEmail: "newer@example.com",
      totalCents: 40_000,
    });
    await insertOrderItem(newer.id, second.id, 25_000);
    await insertOrderItem(newer.id, third.id, 15_000);

    const list = await getAdminOrders();
    const ids = list.map((order) => order.id);

    // Newest first.
    expect(ids.indexOf(newer.id)).toBeLessThan(ids.indexOf(older.id));

    const olderResult = list.find((order) => order.id === older.id)!;
    expect(olderResult.customerName).toBe("Older Customer");
    expect(olderResult.customerEmail).toBe("older@example.com");
    expect(olderResult.totalCents).toBe(10_000);
    expect(olderResult.createdAt).toBeInstanceOf(Date);
    expect(olderResult.items).toHaveLength(1);
    expect(olderResult.items[0].artwork.title).toBe("First");

    const newerResult = list.find((order) => order.id === newer.id)!;
    expect(newerResult.items).toHaveLength(2);
    expect(newerResult.items.map((item) => item.artwork.title).sort()).toEqual([
      "Second",
      "Third",
    ]);
  });
});

describe("getAdminOrderById", () => {
  it("returns full detail for an Order covering a single Artwork", async () => {
    const artwork = await insertArtwork({ title: "Solo", priceCents: 30_000 });
    const order = await insertOrder({
      customerName: "Solo Customer",
      customerEmail: "solo@example.com",
      totalCents: 30_000,
    });
    await insertOrderItem(order.id, artwork.id, 30_000);

    const detail = await getAdminOrderById(order.id);

    expect(detail?.customerName).toBe("Solo Customer");
    expect(detail?.customerEmail).toBe("solo@example.com");
    expect(detail?.totalCents).toBe(30_000);
    expect(detail?.items).toHaveLength(1);
    expect(detail?.items[0].artwork.title).toBe("Solo");
    expect(detail?.items[0].priceCents).toBe(30_000);
  });

  it("returns every Artwork covered by an Order with multiple Order Items", async () => {
    const a = await insertArtwork({ title: "A", priceCents: 10_000 });
    const b = await insertArtwork({ title: "B", priceCents: 20_000 });
    const order = await insertOrder({ totalCents: 30_000 });
    await insertOrderItem(order.id, a.id, 10_000);
    await insertOrderItem(order.id, b.id, 20_000);

    const detail = await getAdminOrderById(order.id);

    expect(detail?.items).toHaveLength(2);
    expect(detail?.items.map((item) => item.artwork.title).sort()).toEqual([
      "A",
      "B",
    ]);
  });

  it("returns undefined for an Order that does not exist", async () => {
    const detail = await getAdminOrderById(999_999_999);
    expect(detail).toBeUndefined();
  });
});
