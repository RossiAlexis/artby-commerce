"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { addToCart, createCart, getCart, removeFromCart } from "@/lib/db/cart";
import { ArtworkUnavailableError } from "@/lib/db/cart-errors";

export const CART_COOKIE = "cart_id";
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

async function getOrCreateCartId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const cart = await createCart();
  cookieStore.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  });
  return cart.id;
}

export type AddToCartResult =
  { success: true } | { success: false; error: string };

export async function addToCartAction(
  artworkId: number,
): Promise<AddToCartResult> {
  const cartId = await getOrCreateCartId();

  try {
    await addToCart(cartId, artworkId);
  } catch (error) {
    if (error instanceof ArtworkUnavailableError) {
      return {
        success: false,
        error: "Esta obra ya no está disponible para reservar.",
      };
    }
    throw error;
  }

  revalidatePath("/galeria", "layout");
  return { success: true };
}

export async function removeFromCartAction(artworkId: number): Promise<void> {
  const cartId = await getCartId();
  if (!cartId) return;

  await removeFromCart(cartId, artworkId);
  revalidatePath("/galeria", "layout");
}

export async function getCurrentCart() {
  const cartId = await getCartId();
  if (!cartId) return { items: [], totalCents: 0 };

  return getCart(cartId);
}
