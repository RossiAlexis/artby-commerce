"use server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./client";
import { users } from "./schema";

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
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
    .values({ email, name, passwordHash, isAdmin: false })
    .returning();

  return user;
}
