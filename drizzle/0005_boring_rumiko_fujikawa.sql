ALTER TABLE "artworks" ADD COLUMN "width" double precision;--> statement-breakpoint
ALTER TABLE "artworks" ADD COLUMN "height" double precision;--> statement-breakpoint
ALTER TABLE "artworks" ADD COLUMN "dimension_unit" text DEFAULT 'cm' NOT NULL;--> statement-breakpoint
ALTER TABLE "artworks" ADD COLUMN "weight_kg" double precision;