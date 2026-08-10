import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { verifyCredentials } from "./credentials";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

function uniqueEmail() {
  return `${crypto.randomUUID()}@example.com`;
}

async function insertUser(overrides: Partial<typeof users.$inferInsert>) {
  const [user] = await db
    .insert(users)
    .values({
      email: uniqueEmail(),
      isAdmin: false,
      ...overrides,
    })
    .returning();
  return user;
}

describe("verifyCredentials", () => {
  it("signs in the admin account and reports it as admin", async () => {
    const passwordHash = await bcrypt.hash("admin-password", 10);
    const admin = await insertUser({
      email: uniqueEmail(),
      passwordHash,
      isAdmin: true,
    });

    const result = await verifyCredentials({
      email: admin.email,
      password: "admin-password",
    });

    expect(result).toEqual(
      expect.objectContaining({ id: admin.id, isAdmin: true }),
    );
  });

  it("signs in a Customer account and reports it as non-admin", async () => {
    const passwordHash = await bcrypt.hash("customer-password", 10);
    const customer = await insertUser({
      email: uniqueEmail(),
      passwordHash,
      isAdmin: false,
    });

    const result = await verifyCredentials({
      email: customer.email,
      password: "customer-password",
    });

    expect(result).toEqual(
      expect.objectContaining({ id: customer.id, isAdmin: false }),
    );
  });

  it("returns null for a wrong password", async () => {
    const passwordHash = await bcrypt.hash("the-real-password", 10);
    const user = await insertUser({ passwordHash });

    const result = await verifyCredentials({
      email: user.email,
      password: "not-the-real-password",
    });

    expect(result).toBeNull();
  });

  it("returns null for an email with no account", async () => {
    const result = await verifyCredentials({
      email: uniqueEmail(),
      password: "anything",
    });

    expect(result).toBeNull();
  });

  it("returns null for a Google-only account with no password set", async () => {
    const user = await insertUser({ passwordHash: null });

    const result = await verifyCredentials({
      email: user.email,
      password: "anything",
    });

    expect(result).toBeNull();
  });
});
