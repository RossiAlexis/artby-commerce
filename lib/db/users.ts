import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./client";
import { users } from "./schema";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  return user;
}

export async function createCustomerAccount({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}) {
  return createAccount({ email, password, name, isAdmin: false });
}

/**
 * Creates the single admin identity (see CONTEXT.md) — only used from the
 * seed script today, not from any public-facing sign-up flow.
 */
export async function createAdminAccount({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}) {
  return createAccount({ email, password, name, isAdmin: true });
}

async function createAccount({
  email,
  password,
  name,
  isAdmin,
}: {
  email: string;
  password: string;
  name?: string;
  isAdmin: boolean;
}) {
  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email: normalizeEmail(email),
      name,
      passwordHash,
      isAdmin,
    })
    .onConflictDoNothing()
    .returning();

  return user;
}
