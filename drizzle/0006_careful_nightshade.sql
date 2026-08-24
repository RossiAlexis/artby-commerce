ALTER TABLE "artworks" ALTER COLUMN "width" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "artworks" ALTER COLUMN "height" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "artworks" DROP COLUMN "dimensions";