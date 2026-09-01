ALTER TABLE "orders" ADD COLUMN "shipping_city" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_country" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_gift" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "gift_recipient_name" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "gift_message" text;