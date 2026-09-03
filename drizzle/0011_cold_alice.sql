ALTER TABLE "orders" ADD COLUMN "status" text DEFAULT 'paid' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "archived" boolean DEFAULT false NOT NULL;