ALTER TABLE "site_settings" ADD COLUMN "notification_email" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "shipping_origin" text DEFAULT 'Ontario, Canadá' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "shipping_insurance_included" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "free_shipping_over_500" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "primary_language" text DEFAULT 'es' NOT NULL;