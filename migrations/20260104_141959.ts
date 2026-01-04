import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_email_campaigns_interests" AS ENUM('academic-bio-med', 'wealth-finance', 'life-legacy', 'digital-aesthetic', 'work-flow', 'new-products', 'sales');
  CREATE TYPE "public"."enum_email_campaigns_type" AS ENUM('new-product', 'upsell', 'newsletter', 'promotion', 'cart-abandonment', 're-engagement');
  CREATE TYPE "public"."enum_email_campaigns_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'failed');
  CREATE TYPE "public"."enum_email_campaigns_audience" AS ENUM('all-subscribers', 'recent-customers', 'all-customers', 'by-interest', 'custom');
  CREATE TYPE "public"."enum_checkouts_items_type" AS ENUM('product', 'bundle');
  CREATE TABLE "email_campaigns_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_email_campaigns_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "email_campaigns" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_email_campaigns_type" NOT NULL,
  	"status" "enum_email_campaigns_status" DEFAULT 'draft' NOT NULL,
  	"subject" varchar NOT NULL,
  	"preview_text" varchar,
  	"content" jsonb NOT NULL,
  	"cta_text" varchar,
  	"cta_url" varchar,
  	"audience" "enum_email_campaigns_audience" DEFAULT 'all-subscribers' NOT NULL,
  	"custom_emails" varchar,
  	"exclude_purchasers" boolean DEFAULT false,
  	"linked_product_id" integer,
  	"linked_bundle_id" integer,
  	"recipient_count" numeric,
  	"sent_at" timestamp(3) with time zone,
  	"scheduled_for" timestamp(3) with time zone,
  	"error_message" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "checkouts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_checkouts_items_type" NOT NULL,
  	"product_id" numeric,
  	"title" varchar NOT NULL,
  	"price" numeric
  );
  
  CREATE TABLE "checkouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"polar_checkout_id" varchar NOT NULL,
  	"email" varchar,
  	"total_amount" numeric,
  	"completed" boolean DEFAULT false,
  	"abandonment_email_sent" boolean DEFAULT false,
  	"checkout_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ADD COLUMN "upsell_sent" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_campaigns_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "checkouts_id" integer;
  ALTER TABLE "email_campaigns_interests" ADD CONSTRAINT "email_campaigns_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_linked_product_id_products_id_fk" FOREIGN KEY ("linked_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_linked_bundle_id_bundles_id_fk" FOREIGN KEY ("linked_bundle_id") REFERENCES "public"."bundles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "checkouts_items" ADD CONSTRAINT "checkouts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "email_campaigns_interests_order_idx" ON "email_campaigns_interests" USING btree ("order");
  CREATE INDEX "email_campaigns_interests_parent_idx" ON "email_campaigns_interests" USING btree ("parent_id");
  CREATE INDEX "email_campaigns_linked_product_idx" ON "email_campaigns" USING btree ("linked_product_id");
  CREATE INDEX "email_campaigns_linked_bundle_idx" ON "email_campaigns" USING btree ("linked_bundle_id");
  CREATE INDEX "email_campaigns_created_by_idx" ON "email_campaigns" USING btree ("created_by_id");
  CREATE INDEX "email_campaigns_updated_at_idx" ON "email_campaigns" USING btree ("updated_at");
  CREATE INDEX "email_campaigns_created_at_idx" ON "email_campaigns" USING btree ("created_at");
  CREATE INDEX "checkouts_items_order_idx" ON "checkouts_items" USING btree ("_order");
  CREATE INDEX "checkouts_items_parent_id_idx" ON "checkouts_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "checkouts_polar_checkout_id_idx" ON "checkouts" USING btree ("polar_checkout_id");
  CREATE INDEX "checkouts_updated_at_idx" ON "checkouts" USING btree ("updated_at");
  CREATE INDEX "checkouts_created_at_idx" ON "checkouts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_campaigns_fk" FOREIGN KEY ("email_campaigns_id") REFERENCES "public"."email_campaigns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_checkouts_fk" FOREIGN KEY ("checkouts_id") REFERENCES "public"."checkouts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_email_campaigns_id_idx" ON "payload_locked_documents_rels" USING btree ("email_campaigns_id");
  CREATE INDEX "payload_locked_documents_rels_checkouts_id_idx" ON "payload_locked_documents_rels" USING btree ("checkouts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "email_campaigns_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_campaigns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "checkouts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "checkouts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "email_campaigns_interests" CASCADE;
  DROP TABLE "email_campaigns" CASCADE;
  DROP TABLE "checkouts_items" CASCADE;
  DROP TABLE "checkouts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_campaigns_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_checkouts_fk";
  
  DROP INDEX "payload_locked_documents_rels_email_campaigns_id_idx";
  DROP INDEX "payload_locked_documents_rels_checkouts_id_idx";
  ALTER TABLE "orders" DROP COLUMN "upsell_sent";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_campaigns_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "checkouts_id";
  DROP TYPE "public"."enum_email_campaigns_interests";
  DROP TYPE "public"."enum_email_campaigns_type";
  DROP TYPE "public"."enum_email_campaigns_status";
  DROP TYPE "public"."enum_email_campaigns_audience";
  DROP TYPE "public"."enum_checkouts_items_type";`)
}
