export const SHIPPING_ORIGINS = [
  "Ontario, Canadá",
  "Quebec, Canadá",
  "Columbia Británica, Canadá",
  "Alberta, Canadá",
  "Manitoba, Canadá",
  "Saskatchewan, Canadá",
  "Nueva Escocia, Canadá",
] as const;

export const FREE_SHIPPING_THRESHOLD_CENTS = 50_000;

const INSTAGRAM_HANDLE = /^@?[A-Za-z0-9._]{1,30}$/;

/** `@handle` when the value is a handle, `""` when blank, `null` when invalid. */
export function normalizeInstagramHandle(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!INSTAGRAM_HANDLE.test(trimmed)) return null;
  return `@${trimmed.replace(/^@/, "")}`;
}

export function instagramUrlFromHandle(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

/** Pull `@handle` out of a stored Instagram URL. Anything else becomes `""`. */
export function instagramHandleFromUrl(url: string | undefined): string {
  if (!url) return "";
  const match = url
    .trim()
    .match(
      /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]{1,30})\/?$/i,
    );
  if (match) return `@${match[1]}`;
  return normalizeInstagramHandle(url) ?? "";
}

export function shippingCheckoutNote(input: {
  shippingOrigin: string;
  shippingInsuranceIncluded: boolean;
  freeShippingOver500: boolean;
  totalCents: number;
}): string {
  const parts = [`Despacho desde ${input.shippingOrigin}.`];
  if (input.shippingInsuranceIncluded) {
    parts.push("Incluye seguro de envío.");
  }
  if (input.freeShippingOver500) {
    parts.push(
      input.totalCents >= FREE_SHIPPING_THRESHOLD_CENTS
        ? "Envío gratuito en esta compra."
        : "Envío gratuito en compras mayores a USD 500.",
    );
  }
  return parts.join(" ");
}
