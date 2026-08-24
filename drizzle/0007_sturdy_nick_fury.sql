ALTER TABLE "site_settings" ADD COLUMN "announcement_bar" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "post_purchase_message" text;--> statement-breakpoint
-- Backfill with the copy that was previously hardcoded in SiteHeader, now
-- that the announcement bar is admin-editable — avoids the banner silently
-- disappearing on deploy for the row that already exists in production.
UPDATE "site_settings" SET "announcement_bar" = 'Envío internacional incluido en todas las obras' WHERE "announcement_bar" IS NULL;