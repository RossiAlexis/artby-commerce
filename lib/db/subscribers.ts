"use server";
import { db } from "./client";
import { subscribers } from "./schema";

/**
 * Stores an email address as a Subscriber for future outreach about new
 * Artworks (see CONTEXT.md's Subscriber entry). Expects an already-validated,
 * already-normalized (trimmed/lowercased) email — validation happens once, at
 * the Server Action boundary (see `app/actions/subscribe.ts`).
 *
 * Duplicate-safe: relies on the `subscribers.email` unique constraint plus
 * `onConflictDoNothing` rather than a separate exists-check + insert,
 * avoiding a race condition between the check and the insert.
 */
export async function subscribe(email: string) {
  const [inserted] = await db
    .insert(subscribers)
    .values({ email })
    .onConflictDoNothing({ target: subscribers.email })
    .returning();

  return inserted;
}
