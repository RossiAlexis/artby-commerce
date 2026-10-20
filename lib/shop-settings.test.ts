import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  instagramHandleFromUrl,
  instagramUrlFromHandle,
  normalizeInstagramHandle,
  shippingCheckoutNote,
} from "./shop-settings";

describe("normalizeInstagramHandle", () => {
  it("accepts a handle with or without @", () => {
    expect(normalizeInstagramHandle("artbyveromiller")).toBe(
      "@artbyveromiller",
    );
    expect(normalizeInstagramHandle("@artbyveromiller")).toBe(
      "@artbyveromiller",
    );
  });

  it("treats a blank value as cleared and rejects spaces", () => {
    expect(normalizeInstagramHandle("  ")).toBe("");
    expect(normalizeInstagramHandle("not a handle")).toBeNull();
  });
});

describe("instagram urls", () => {
  it("round-trips a profile URL into a handle", () => {
    expect(
      instagramHandleFromUrl("https://instagram.com/artbyveromiller"),
    ).toBe("@artbyveromiller");
    expect(instagramUrlFromHandle("@artbyveromiller")).toBe(
      "https://instagram.com/artbyveromiller",
    );
  });
});

describe("shippingCheckoutNote", () => {
  const base = {
    shippingOrigin: "Ontario, Canadá",
    shippingInsuranceIncluded: true,
    freeShippingOver500: true,
  };

  it("names the origin, insurance, and the threshold when the cart is under it", () => {
    expect(shippingCheckoutNote({ ...base, totalCents: 10_000 })).toBe(
      "Despacho desde Ontario, Canadá. Incluye seguro de envío. Envío gratuito en compras mayores a USD 500.",
    );
  });

  it("marks the current purchase free once the cart reaches USD 500", () => {
    expect(
      shippingCheckoutNote({
        ...base,
        shippingInsuranceIncluded: false,
        totalCents: FREE_SHIPPING_THRESHOLD_CENTS,
      }),
    ).toBe("Despacho desde Ontario, Canadá. Envío gratuito en esta compra.");
  });
});
