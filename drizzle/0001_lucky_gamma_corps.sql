CREATE TABLE "artwork_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"artwork_id" integer NOT NULL,
	"url" text NOT NULL,
	"position" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"dimensions" text NOT NULL,
	"medium" text NOT NULL,
	"year" smallint NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"featured_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"cover_image_url" text NOT NULL,
	"hero_tagline" text NOT NULL,
	"about_image_url" text NOT NULL,
	"about_title" text NOT NULL,
	"about_description" text NOT NULL,
	"social_links" jsonb NOT NULL,
	"contact_info" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artwork_photos" ADD CONSTRAINT "artwork_photos_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;