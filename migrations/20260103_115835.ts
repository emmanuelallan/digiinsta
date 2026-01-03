import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categories_icon" AS ENUM('Microscope', 'ChartLine', 'Sparkles', 'Palette', 'Workflow', 'Folder');
  CREATE TYPE "public"."enum_categories_gradient" AS ENUM('from-blue-500 to-cyan-500', 'from-emerald-500 to-green-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500', 'from-indigo-500 to-violet-500', 'from-gray-500 to-gray-600');
  CREATE TYPE "public"."enum_subcategories_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_hero_slides_text_position" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_hero_slides_text_color" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_hero_slides_overlay_opacity" AS ENUM('0', '20', '40', '60');
  CREATE TYPE "public"."enum_hero_slides_status" AS ENUM('active', 'draft', 'archived');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'in-progress', 'resolved', 'spam');
  CREATE TYPE "public"."enum_newsletter_subscribers_interests" AS ENUM('academic-bio-med', 'wealth-finance', 'life-legacy', 'digital-aesthetic', 'work-flow', 'new-products', 'sales');
  CREATE TYPE "public"."enum_newsletter_subscribers_status" AS ENUM('subscribed', 'unsubscribed', 'bounced', 'complained');
  CREATE TYPE "public"."enum_newsletter_subscribers_source" AS ENUM('footer', 'popup', 'checkout', 'blog', 'landing', 'import', 'other');
  CREATE TABLE "subcategories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"category_id" integer NOT NULL,
  	"status" "enum_subcategories_status" DEFAULT 'active' NOT NULL,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"headline" varchar NOT NULL,
  	"subheadline" varchar,
  	"image_id" integer NOT NULL,
  	"mobile_image_id" integer,
  	"primary_cta_label" varchar DEFAULT 'Shop Now' NOT NULL,
  	"primary_cta_href" varchar DEFAULT '/categories' NOT NULL,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar,
  	"text_position" "enum_hero_slides_text_position" DEFAULT 'left',
  	"text_color" "enum_hero_slides_text_color" DEFAULT 'light',
  	"overlay_opacity" "enum_hero_slides_overlay_opacity" DEFAULT '40',
  	"order" numeric DEFAULT 0 NOT NULL,
  	"status" "enum_hero_slides_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"status" "enum_contact_submissions_status" DEFAULT 'new' NOT NULL,
  	"notes" varchar,
  	"assigned_to_id" integer,
  	"source" varchar,
  	"ip_address" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_newsletter_subscribers_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"first_name" varchar,
  	"status" "enum_newsletter_subscribers_status" DEFAULT 'subscribed' NOT NULL,
  	"source" "enum_newsletter_subscribers_source" DEFAULT 'footer',
  	"subscribed_at" timestamp(3) with time zone,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  
  ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
  
  DROP INDEX "categories_parent_idx";
  DROP INDEX "products_category_idx";
  ALTER TABLE "categories" ADD COLUMN "icon" "enum_categories_icon" DEFAULT 'Folder';
  ALTER TABLE "categories" ADD COLUMN "gradient" "enum_categories_gradient" DEFAULT 'from-gray-500 to-gray-600';
  ALTER TABLE "products" ADD COLUMN "subcategory_id" integer NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subcategories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hero_slides_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_submissions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletter_subscribers_id" integer;
  ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_mobile_image_id_media_id_fk" FOREIGN KEY ("mobile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletter_subscribers_interests" ADD CONSTRAINT "newsletter_subscribers_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "subcategories_slug_idx" ON "subcategories" USING btree ("slug");
  CREATE INDEX "subcategories_category_idx" ON "subcategories" USING btree ("category_id");
  CREATE INDEX "subcategories_meta_meta_image_idx" ON "subcategories" USING btree ("meta_image_id");
  CREATE INDEX "subcategories_updated_at_idx" ON "subcategories" USING btree ("updated_at");
  CREATE INDEX "subcategories_created_at_idx" ON "subcategories" USING btree ("created_at");
  CREATE INDEX "hero_slides_image_idx" ON "hero_slides" USING btree ("image_id");
  CREATE INDEX "hero_slides_mobile_image_idx" ON "hero_slides" USING btree ("mobile_image_id");
  CREATE INDEX "hero_slides_updated_at_idx" ON "hero_slides" USING btree ("updated_at");
  CREATE INDEX "hero_slides_created_at_idx" ON "hero_slides" USING btree ("created_at");
  CREATE INDEX "contact_submissions_assigned_to_idx" ON "contact_submissions" USING btree ("assigned_to_id");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX "newsletter_subscribers_interests_order_idx" ON "newsletter_subscribers_interests" USING btree ("order");
  CREATE INDEX "newsletter_subscribers_interests_parent_idx" ON "newsletter_subscribers_interests" USING btree ("parent_id");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subcategories_fk" FOREIGN KEY ("subcategories_id") REFERENCES "public"."subcategories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_slides_fk" FOREIGN KEY ("hero_slides_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_subcategory_idx" ON "products" USING btree ("subcategory_id");
  CREATE INDEX "payload_locked_documents_rels_subcategories_id_idx" ON "payload_locked_documents_rels" USING btree ("subcategories_id");
  CREATE INDEX "payload_locked_documents_rels_hero_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_slides_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  ALTER TABLE "categories" DROP COLUMN "parent_id";
  ALTER TABLE "products" DROP COLUMN "category_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "subcategories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hero_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletter_subscribers_interests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletter_subscribers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "subcategories" CASCADE;
  DROP TABLE "hero_slides" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "newsletter_subscribers_interests" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_subcategory_id_subcategories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subcategories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hero_slides_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk";
  
  DROP INDEX "products_subcategory_idx";
  DROP INDEX "payload_locked_documents_rels_subcategories_id_idx";
  DROP INDEX "payload_locked_documents_rels_hero_slides_id_idx";
  DROP INDEX "payload_locked_documents_rels_contact_submissions_id_idx";
  DROP INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx";
  ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "products" ADD COLUMN "category_id" integer NOT NULL;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  ALTER TABLE "categories" DROP COLUMN "icon";
  ALTER TABLE "categories" DROP COLUMN "gradient";
  ALTER TABLE "products" DROP COLUMN "subcategory_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subcategories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hero_slides_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_submissions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletter_subscribers_id";
  DROP TYPE "public"."enum_categories_icon";
  DROP TYPE "public"."enum_categories_gradient";
  DROP TYPE "public"."enum_subcategories_status";
  DROP TYPE "public"."enum_hero_slides_text_position";
  DROP TYPE "public"."enum_hero_slides_text_color";
  DROP TYPE "public"."enum_hero_slides_overlay_opacity";
  DROP TYPE "public"."enum_hero_slides_status";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_newsletter_subscribers_interests";
  DROP TYPE "public"."enum_newsletter_subscribers_status";
  DROP TYPE "public"."enum_newsletter_subscribers_source";`)
}
