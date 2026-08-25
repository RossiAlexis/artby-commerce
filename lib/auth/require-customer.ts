import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Used from `/cuenta/*` Server Components that show a Customer's own data
 * (Order history, Order detail) — sends a signed-out visitor to sign in.
 * Unlike `requireAdminPage`, this only checks that *some* Customer is signed
 * in (no `isAdmin` flag involved), and returns just their id since that's
 * all these pages need to scope their queries.
 */
export async function requireCustomerPage(callbackUrl: string) {
  const session = await auth();
  const customerId = session?.user?.id;
  if (!customerId) {
    redirect(`/cuenta/ingresar?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return customerId;
}
