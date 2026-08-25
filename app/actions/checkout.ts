"use server";
import { revalidatePath } from "next/cache";
import z from "zod";
import { auth } from "@/auth";
import { getCartId } from "@/app/actions/cart";
import { EmptyCartError, ReservationExpiredError } from "@/lib/db/order-errors";
import { checkoutCart } from "@/lib/db/orders";

const checkoutSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export type CheckoutResult =
  { success: true; orderId: number } | { success: false; error: string };

export async function checkoutAction(
  input: z.infer<typeof checkoutSchema>,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Ingresa un nombre y correo válidos." };
  }

  const [cartId, session] = await Promise.all([getCartId(), auth()]);
  if (!cartId) {
    return { success: false, error: "Tu carrito está vacío." };
  }

  try {
    const order = await checkoutCart({
      cartId,
      customerName: parsed.data.name,
      customerEmail: parsed.data.email,
      // Associates the Order with the Customer's account when they're
      // signed in at checkout — left unset for guest checkouts.
      customerId: session?.user?.id,
    });
    revalidatePath("/galeria", "layout");
    return { success: true, orderId: order.id };
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return { success: false, error: "Tu carrito está vacío." };
    }
    if (error instanceof ReservationExpiredError) {
      return {
        success: false,
        error:
          "Una o más obras de tu carrito ya no están disponibles. Por favor revisa tu carrito.",
      };
    }
    throw error;
  }
}
