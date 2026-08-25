import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceCents: number, currency: string) {
  const hasCents = priceCents % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);
}

// The site's copy is consistently Rioplatense/Argentine Spanish (voseo:
// "Sumate", "Creá", "Ingresá") — es-AR keeps date formatting consistent
// with that, rather than each caller picking its own locale.
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-AR", options).format(date);
}
