"use server";
import z from "zod";
import { db } from "./client";
import { subscribers } from "./schema";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export class InvalidEmailError extends Error {
  constructor() {
    super("Invalid email address.");
    this.name = "InvalidEmailError";
  }
}

/**
 * Stores an email address as a Subscriber for future outreach about new
 * Artworks (see CONTEXT.md's Subscriber entry). Duplicate-safe: relies on
 * the `subscribers.email` unique constraint plus `onConflictDoNothing`
 * rather than a separate exists-check + insert, avoiding a race condition
 * between the check and the insert.
 */
export async function subscribe(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    throw new InvalidEmailError();
  }

  const [inserted] = await db
    .insert(subscribers)
    .values({ email: parsed.data })
    .onConflictDoNothing({ target: subscribers.email })
    .returning();

  return inserted;
}
