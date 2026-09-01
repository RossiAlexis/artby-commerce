"use server";
import { revalidatePath } from "next/cache";
import z from "zod";
import { auth } from "@/auth";
import { getCartId } from "@/app/actions/cart";
import { EmptyCartError, ReservationExpiredError } from "@/lib/db/order-errors";
import { checkoutCart } from "@/lib/db/orders";

const checkoutSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    city: z.string().trim().min(1),
    country: z.string().trim().min(1),
    address: z.string().trim().min(1),
    isGift: z.boolean(),
    giftRecipientName: z.string().trim().optional(),
    giftMessage: z.string().trim().optional(),
  })
  .refine((data) => !data.isGift || Boolean(data.giftRecipientName), {
    message: "Ingresa el nombre de quien recibe el regalo.",
    path: ["giftRecipientName"],
  });

export type CheckoutResult =
  { success: true; orderId: number } | { success: false; error: string };

export async function checkoutAction(
  input: z.infer<typeof checkoutSchema>,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Completa todos los campos requeridos con datos válidos.",
    };
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
      shippingCity: parsed.data.city,
      shippingCountry: parsed.data.country,
      shippingAddress: parsed.data.address,
      isGift: parsed.data.isGift,
      giftRecipientName: parsed.data.giftRecipientName,
      giftMessage: parsed.data.giftMessage,
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
