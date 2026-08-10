import { describe, expect, it } from "vitest";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { jwt, session } from "./callbacks";

function baseSession(): Session {
  return {
    user: { id: "", isAdmin: false },
    expires: new Date().toISOString(),
  } as Session;
}

describe("jwt callback", () => {
  it("copies isAdmin from the signed-in admin user onto the token", async () => {
    const token = await jwt({
      token: {} as JWT,
      user: { id: "admin-1", isAdmin: true },
    } as Parameters<typeof jwt>[0]);

    expect(token?.isAdmin).toBe(true);
  });

  it("copies isAdmin from a signed-in Customer user onto the token", async () => {
    const token = await jwt({
      token: {} as JWT,
      user: { id: "customer-1", isAdmin: false },
    } as Parameters<typeof jwt>[0]);

    expect(token?.isAdmin).toBe(false);
  });

  it("leaves an existing token's isAdmin untouched on token refresh (no user present)", async () => {
    const token = await jwt({
      token: { isAdmin: true } as JWT,
      user: undefined,
    } as unknown as Parameters<typeof jwt>[0]);

    expect(token?.isAdmin).toBe(true);
  });
});

describe("session callback", () => {
  it("distinguishes an admin session from a Customer session", async () => {
    const adminSession = await session({
      session: baseSession(),
      token: { isAdmin: true } as JWT,
    } as Parameters<typeof session>[0]);
    const customerSession = await session({
      session: baseSession(),
      token: { isAdmin: false } as JWT,
    } as Parameters<typeof session>[0]);

    expect((adminSession as Session).user.isAdmin).toBe(true);
    expect((customerSession as Session).user.isAdmin).toBe(false);
  });
});
