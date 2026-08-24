import { describe, expect, it } from "vitest";
import {
  createAdminAccount,
  createCustomerAccount,
  getUserByEmail,
} from "./users";

function uniqueEmail() {
  return `${crypto.randomUUID()}@example.com`;
}

describe("createCustomerAccount", () => {
  it("creates a non-admin user with a hashed (not plaintext) password", async () => {
    const email = uniqueEmail();

    const user = await createCustomerAccount({
      email,
      password: "correct-horse-battery-staple",
      name: "Ada Customer",
    });

    expect(user.email).toBe(email);
    expect(user.name).toBe("Ada Customer");
    expect(user.isAdmin).toBe(false);
    expect(user.passwordHash).not.toBeNull();
    expect(user.passwordHash).not.toBe("correct-horse-battery-staple");
  });
});

describe("createAdminAccount", () => {
  it("creates an admin user with a hashed password", async () => {
    const email = uniqueEmail();

    const user = await createAdminAccount({
      email,
      password: "correct-horse-battery-staple",
      name: "Vero Admin",
    });

    expect(user.email).toBe(email);
    expect(user.isAdmin).toBe(true);
    expect(user.passwordHash).not.toBeNull();
    expect(user.passwordHash).not.toBe("correct-horse-battery-staple");
  });
});

describe("getUserByEmail", () => {
  it("returns the user matching the given email", async () => {
    const email = uniqueEmail();
    const created = await createCustomerAccount({
      email,
      password: "correct-horse-battery-staple",
    });

    const found = await getUserByEmail(email);

    expect(found?.id).toBe(created.id);
  });

  it("returns undefined when no user matches", async () => {
    const found = await getUserByEmail(uniqueEmail());

    expect(found).toBeUndefined();
  });
});
