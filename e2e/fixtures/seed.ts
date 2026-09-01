import { Pool, neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import {
  artworkPhotos,
  artworks,
  orderItems,
  orders,
  siteSettings,
  users,
} from "../../lib/db/schema";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ARTWORK,
  SITE_SETTINGS,
} from "./constants";

neonConfig.webSocketConstructor = ws;

const SEED_PHOTOS = [
  "/seed/art-work-1.png",
  "/seed/art-work-2.png",
  "/seed/art-work-3.png",
  "/seed/art-work-4.png",
];

/**
 * Seeds one fresh, migrated Neon branch with everything the e2e specs
 * reference by name (see `constants.ts`). Each artwork is owned by exactly
 * one spec's mutating test — see `constants.ts` for the assignment — so
 * Playwright's parallel workers never race on the same row.
 */
export async function seedTestData(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, {
    schema: {
      artworks,
      artworkPhotos,
      orders,
      orderItems,
      siteSettings,
      users,
    },
  });

  // Test branches inherit the parent branch's data (not just its schema),
  // so an admin user with this email may already exist — upsert rather than
  // insert so the known ADMIN_PASSWORD always works regardless of whatever
  // password hash the inherited row happened to carry.
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db
    .insert(users)
    .values({
      email: ADMIN_EMAIL,
      name: "Vero Miller",
      passwordHash,
      isAdmin: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, isAdmin: true },
    });

  await db.insert(siteSettings).values({
    coverImageUrl: "/seed/cover.png",
    heroTagline: SITE_SETTINGS.heroTagline,
    announcementBar: SITE_SETTINGS.announcementBar,
    aboutImageUrl: "/seed/about-artist-image.png",
    aboutTitle: SITE_SETTINGS.aboutTitle,
    aboutDescription: SITE_SETTINGS.aboutDescription,
    postPurchaseMessage: SITE_SETTINGS.postPurchaseMessage,
    socialLinks: { instagram: SITE_SETTINGS.instagram },
    contactInfo: { email: SITE_SETTINGS.contactEmail },
  });

  async function insertArtwork(
    fixture: { title: string; priceCents: number },
    photoIndex: number,
    flags: { sold?: boolean; featured?: boolean } = {},
  ) {
    const [artwork] = await db
      .insert(artworks)
      .values({
        title: fixture.title,
        description: `Descripción de prueba para ${fixture.title}.`,
        width: 40,
        height: 50,
        medium: "Acrílico sobre lienzo",
        year: 2024,
        priceCents: fixture.priceCents,
        sold: flags.sold ?? false,
        featured: flags.featured ?? false,
        // `new Date()` — not epoch-0 — so this always sorts first among
        // Featured Artworks (last-4-by-`featuredAt`-desc), regardless of
        // whatever Featured rows the branch inherited from its parent.
        featuredAt: flags.featured ? new Date() : null,
      })
      .returning();

    await db.insert(artworkPhotos).values({
      artworkId: artwork.id,
      url: SEED_PHOTOS[photoIndex % SEED_PHOTOS.length],
      position: 0,
    });

    return artwork;
  }

  const display = await insertArtwork(ARTWORK.display, 0, { featured: true });
  const sold = await insertArtwork(ARTWORK.sold, 1, { sold: true });
  await insertArtwork(ARTWORK.deleteMe, 2);
  await insertArtwork(ARTWORK.toggleMe, 3);
  await insertArtwork(ARTWORK.guestCheckout, 0);
  await insertArtwork(ARTWORK.customerCheckout, 1);
  const blockedDelete = await insertArtwork(ARTWORK.blockedDelete, 2, {
    sold: true,
  });

  async function insertOrderFor(
    artworkId: number,
    fixture: { buyerName: string; buyerEmail: string; priceCents: number },
  ) {
    const [order] = await db
      .insert(orders)
      .values({
        customerName: fixture.buyerName,
        customerEmail: fixture.buyerEmail,
        totalCents: fixture.priceCents,
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      artworkId,
      priceCents: fixture.priceCents,
    });
  }

  await insertOrderFor(sold.id, ARTWORK.sold);
  await insertOrderFor(blockedDelete.id, ARTWORK.blockedDelete);

  await pool.end();

  return { displayArtworkId: display.id, soldArtworkId: sold.id };
}
