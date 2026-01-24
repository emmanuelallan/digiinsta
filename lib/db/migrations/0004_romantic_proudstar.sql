ALTER TABLE "collections" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "occasions" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" text;--> statement-breakpoint

-- Generate slugs for existing collections
UPDATE "collections" SET "slug" = lower(regexp_replace(regexp_replace("title", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint

-- Generate slugs for existing occasions
UPDATE "occasions" SET "slug" = lower(regexp_replace(regexp_replace("title", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint

-- Generate slugs for existing products
UPDATE "products" SET "slug" = lower(regexp_replace(regexp_replace("name", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE "slug" IS NULL;--> statement-breakpoint

-- Now make slug columns NOT NULL
ALTER TABLE "collections" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "occasions" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

CREATE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "occasions_slug_idx" ON "occasions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "occasions" ADD CONSTRAINT "occasions_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");