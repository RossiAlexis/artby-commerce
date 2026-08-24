import { redirect } from "next/navigation";
import { auth } from "@/auth";

export class NotAdminError extends Error {
  constructor(message = "An admin session is required.") {
    super(message);
    this.name = "NotAdminError";
  }
}

/** Used from `/admin/*` Server Components — sends non-admins to sign in. */
export async function requireAdminPage(callbackUrl: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

/**
 * Used from admin Server Actions — the `/admin/*` page gate above keeps a
 * non-admin from reaching the UI that calls these, but a Server Action is
 * also a public network endpoint on its own, so it re-checks independently.
 */
export async function requireAdminAction() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new NotAdminError();
  }
  return session;
}
