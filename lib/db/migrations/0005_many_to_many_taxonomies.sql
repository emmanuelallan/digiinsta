-- Create many-to-many junction tables for collections, occasions, and product types

-- Product Collections junction table
CREATE TABLE IF NOT EXISTS "product_collections" (
	"product_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	CONSTRAINT "product_collections_product_id_collection_id_pk" PRIMARY KEY("product_id","collection_id")
);

-- Product Occasions junction table
CREATE TABLE IF NOT EXISTS "product_occasions" (
	"product_id" uuid NOT NULL,
	"occasion_id" uuid NOT NULL,
	CONSTRAINT "product_occasions_product_id_occasion_id_pk" PRIMARY KEY("product_id","occasion_id")
);

-- Product Types junction table
CREATE TABLE IF NOT EXISTS "product_product_types" (
	"product_id" uuid NOT NULL,
	"product_type_id" uuid NOT NULL,
	CONSTRAINT "product_product_types_product_id_product_type_id_pk" PRIMARY KEY("product_id","product_type_id")
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_occasions" ADD CONSTRAINT "product_occasions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_occasions" ADD CONSTRAINT "product_occasions_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_product_types" ADD CONSTRAINT "product_product_types_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_product_types" ADD CONSTRAINT "product_product_types_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "product_collections_product_idx" ON "product_collections" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "product_collections_collection_idx" ON "product_collections" USING btree ("collection_id");
CREATE INDEX IF NOT EXISTS "product_occasions_product_idx" ON "product_occasions" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "product_occasions_occasion_idx" ON "product_occasions" USING btree ("occasion_id");
CREATE INDEX IF NOT EXISTS "product_product_types_product_idx" ON "product_product_types" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "product_product_types_product_type_idx" ON "product_product_types" USING btree ("product_type_id");

-- Migrate existing data from old foreign keys to new junction tables
-- Only migrate if the foreign key is not null
INSERT INTO "product_collections" ("product_id", "collection_id")
SELECT "id", "collection_id" 
FROM "products" 
WHERE "collection_id" IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO "product_occasions" ("product_id", "occasion_id")
SELECT "id", "occasion_id" 
FROM "products" 
WHERE "occasion_id" IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO "product_product_types" ("product_id", "product_type_id")
SELECT "id", "product_type_id" 
FROM "products" 
WHERE "product_type_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Note: We're keeping the old foreign key columns for backward compatibility
-- They can be removed in a future migration after all code is updated
