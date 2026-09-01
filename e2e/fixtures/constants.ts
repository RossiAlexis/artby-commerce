/**
 * Fixed fixture data seeded by `e2e/fixtures/seed.ts` before the run. Each
 * artwork is dedicated to exactly one spec's mutations (toggle/delete/buy)
 * so parallel workers running different spec files never race on the same
 * row — see the comment in `seed.ts` for the full rationale.
 */

export const ADMIN_EMAIL = "admin@artbyveromiller.com";
export const ADMIN_PASSWORD = "changeme123";

export const ARTWORK = {
  /** Read-only: gallery listing, filters, detail page, homepage featured. Never mutated. */
  display: {
    title: "Acuarela del Río E2E",
    priceCents: 45_000,
  },
  /** Read-only: Sold badge, disabled purchase, delete-blocked-by-order. Never mutated further. */
  sold: {
    title: "Retrato Vendido E2E",
    priceCents: 60_000,
    customerEmail: "sold-buyer-e2e@example.com",
    customerName: "Comprador Previo",
  },
  /** Exclusive to admin-artworks.spec.ts's "delete succeeds" test. */
  deleteMe: {
    title: "Boceto Descartable E2E",
    priceCents: 20_000,
  },
  /**
   * Exclusive to admin-artworks.spec.ts's "delete blocked by Order" test —
   * separate from `sold` above (which public-storefront.spec.ts reads
   * concurrently) since this one gets hidden mid-test.
   */
  blockedDelete: {
    title: "Obra Reservada E2E",
    priceCents: 55_000,
    customerEmail: "blocked-buyer-e2e@example.com",
    customerName: "Comprador Bloqueante",
  },
  /** Exclusive to admin-artworks.spec.ts's "toggle flags" test. */
  toggleMe: {
    title: "Estudio para Alternar E2E",
    priceCents: 30_000,
  },
  /** Exclusive to public-storefront.spec.ts's guest-checkout test. */
  guestCheckout: {
    title: "Paisaje Otoñal E2E",
    priceCents: 35_000,
  },
  /** Exclusive to customer-account.spec.ts's purchase + order-history test. */
  customerCheckout: {
    title: "Bodegón Sereno E2E",
    priceCents: 40_000,
  },
} as const;

export const SITE_SETTINGS = {
  heroTagline: "Pinturas para el lugar que las estaba esperando — E2E",
  announcementBar: "Envío internacional incluido en todas las obras",
  aboutTitle: "Vero Miller",
  aboutDescription: "El arte no fue una elección — texto de prueba E2E.",
  instagram: "https://instagram.com/artbyveromiller",
  contactEmail: "hola@artbyveromiller.com",
  postPurchaseMessage: "Gracias por llevarte esta obra a casa — E2E.",
};
