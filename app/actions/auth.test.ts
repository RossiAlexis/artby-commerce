import { describe, expect, it } from "vitest";
import { signUpCustomer } from "./auth";
import { getUserByEmail } from "@/lib/db/users";

function uniqueEmail() {
  return `${crypto.randomUUID()}@example.com`;
}

describe("signUpCustomer", () => {
  it("creates a new Customer account from a valid email/password", async () => {
    const email = uniqueEmail();

    const result = await signUpCustomer({
      email,
      password: "correct-horse-battery-staple",
      name: "Ada Customer",
    });

    expect(result).toEqual({ success: true });
    const user = await getUserByEmail(email);
    expect(user?.isAdmin).toBe(false);
    expect(user?.name).toBe("Ada Customer");
  });

  it("rejects a duplicate email without creating a second account", async () => {
    const email = uniqueEmail();
    await signUpCustomer({ email, password: "correct-horse-battery-staple" });

    const result = await signUpCustomer({
      email,
      password: "another-password",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const email = uniqueEmail();

    const result = await signUpCustomer({ email, password: "short" });

    expect(result.success).toBe(false);
    expect(await getUserByEmail(email)).toBeUndefined();
  });

  it("rejects an invalid email", async () => {
    const result = await signUpCustomer({
      email: "not-an-email",
      password: "correct-horse-battery-staple",
    });

    expect(result.success).toBe(false);
  });
});
