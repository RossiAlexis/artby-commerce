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
  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({
      email: normalizeEmail(email),
      name,
      passwordHash,
      isAdmin: false,
    })
    .onConflictDoNothing()
    .returning();

  return user;
}
