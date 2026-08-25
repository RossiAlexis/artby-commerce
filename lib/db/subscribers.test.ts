import { count, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "./client";
import { subscribers } from "./schema";
import { InvalidEmailError, subscribe } from "./subscribers";

describe("subscribe", () => {
  it("stores a new email as a Subscriber", async () => {
    const inserted = await subscribe("jane@example.com");

    expect(inserted?.email).toBe("jane@example.com");

    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, "jane@example.com"));
    expect(row).toBeDefined();
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it("does not create a second row for a duplicate email", async () => {
    await subscribe("duplicate@example.com");

    const [{ value: countBefore }] = await db
      .select({ value: count() })
      .from(subscribers)
      .where(eq(subscribers.email, "duplicate@example.com"));
    expect(countBefore).toBe(1);

    await subscribe("duplicate@example.com");

    const [{ value: countAfter }] = await db
      .select({ value: count() })
      .from(subscribers)
      .where(eq(subscribers.email, "duplicate@example.com"));
    expect(countAfter).toBe(1);
  });

  it("normalizes email casing/whitespace so duplicates aren't stored under different forms", async () => {
    await subscribe("Case@Example.com");
    await subscribe("  case@example.com  ");

    const [{ value: matches }] = await db
      .select({ value: count() })
      .from(subscribers)
      .where(eq(subscribers.email, "case@example.com"));
    expect(matches).toBe(1);
  });

  it("rejects an invalid email format before hitting the database", async () => {
    await expect(subscribe("not-an-email")).rejects.toThrow(
      InvalidEmailError,
    );

    const [{ value: matches }] = await db
      .select({ value: count() })
      .from(subscribers)
      .where(eq(subscribers.email, "not-an-email"));
    expect(matches).toBe(0);
  });
});
