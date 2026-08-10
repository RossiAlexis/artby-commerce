import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const healthChecks = pgTable("health_checks", {
  id: serial("id").primaryKey(),
  checkedAt: timestamp("checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dimensions: text("dimensions").notNull(),
  medium: text("medium").notNull(),
  year: smallint("year").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  sold: boolean("sold").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  featuredAt: timestamp("featured_at", { withTimezone: true }),
  // Transient hold created by adding this Artwork to a Cart (see
  // ADR-0003) — checked/cleaned up on read rather than via a scheduled job.
  // Distinct from `sold`, which is final.
  reservedUntil: timestamp("reserved_until", { withTimezone: true }),
  reservedByCartId: text("reserved_by_cart_id").references(() => carts.id, {
    onDelete: "set null",
  }),
});

export const artworkPhotos = pgTable("artwork_photos", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id")
    .notNull()
    .references(() => artworks.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: smallint("position").notNull(),
});

export const artworksRelations = relations(artworks, ({ many }) => ({
  photos: many(artworkPhotos),
}));

export const artworkPhotosRelations = relations(artworkPhotos, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkPhotos.artworkId],
    references: [artworks.id],
  }),
}));

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  coverImageUrl: text("cover_image_url").notNull(),
  heroTagline: text("hero_tagline").notNull(),
  aboutImageUrl: text("about_image_url").notNull(),
  aboutTitle: text("about_title").notNull(),
  aboutDescription: text("about_description").notNull(),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().notNull(),
  contactInfo: jsonb("contact_info").$type<Record<string, string>>().notNull(),
});

// Auth.js's standard adapter schema (users/accounts/sessions/verification
// tokens) — column names/types follow the Drizzle adapter's contract
// (https://authjs.dev/getting-started/adapters/drizzle), so `id` is a
// text/uuid PK rather than this file's usual `serial`.
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  // Only set for Credentials accounts — null for Google-only accounts.
  passwordHash: text("password_hash"),
  // The single admin identity is distinguished from Customer accounts by
  // this flag rather than a role/permissions system (see CONTEXT.md).
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const carts = pgTable("carts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Null for a guest Cart — set when the Customer is signed in.
  customerId: text("customer_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    artworkId: integer("artwork_id")
      .notNull()
      .references(() => artworks.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (cartItem) => [unique().on(cartItem.cartId, cartItem.artworkId)],
);

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  artwork: one(artworks, {
    fields: [cartItems.artworkId],
    references: [artworks.id],
  }),
}));
