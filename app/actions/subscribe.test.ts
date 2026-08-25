import { count, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { subscribers } from "@/lib/db/schema";
import { subscribeAction } from "./subscribe";

describe("subscribeAction", () => {
  it("stores a valid email as a Subscriber", async () => {
    const result = await subscribeAction({ email: "vip@example.com" });

    expect(result).toEqual({ success: true });

    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, "vip@example.com"));
    expect(row).toBeDefined();
  });

  it("rejects an invalid email", async () => {
    const result = await subscribeAction({ email: "not-an-email" });

    expect(result).toEqual({
      success: false,
      error: "Ingresá un email válido.",
    });
  });

  it("normalizes casing/whitespace so duplicates aren't stored under different forms", async () => {
    await subscribeAction({ email: "Case@Example.com" });
    await subscribeAction({ email: "  case@example.com  " });

    const [{ value: matches }] = await db
      .select({ value: count() })
      .from(subscribers)
      .where(eq(subscribers.email, "case@example.com"));
    expect(matches).toBe(1);
  });
});
