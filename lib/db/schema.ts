import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
