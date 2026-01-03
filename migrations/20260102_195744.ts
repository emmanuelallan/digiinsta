import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP CONSTRAINT "products_og_image_id_media_id_fk";
  
  ALTER TABLE "bundles" DROP CONSTRAINT "bundles_og_image_id_media_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_og_image_id_media_id_fk";
  
  ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_posts_status";
  CREATE TYPE "public"."enum_posts_status" AS ENUM('published', 'draft', 'archived');
  ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_posts_status";
  ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE "public"."enum_posts_status" USING "status"::"public"."enum_posts_status";
  DROP INDEX "products_og_image_idx";
  DROP INDEX "bundles_og_image_idx";
  DROP INDEX "posts_og_image_idx";
  ALTER TABLE "products" ADD COLUMN "created_by_id" integer NOT NULL;
  ALTER TABLE "products" ADD COLUMN "file_id" integer NOT NULL;
  ALTER TABLE "products" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "bundles" ADD COLUMN "created_by_id" integer NOT NULL;
  ALTER TABLE "bundles" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "orders" ADD COLUMN "created_by_id" integer;
  ALTER TABLE "posts" ADD COLUMN "category_id" integer;
  ALTER TABLE "posts" ADD COLUMN "created_by_id" integer NOT NULL;
  ALTER TABLE "posts" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles" ADD CONSTRAINT "bundles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles" ADD CONSTRAINT "bundles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_created_by_idx" ON "products" USING btree ("created_by_id");
  CREATE INDEX "products_file_idx" ON "products" USING btree ("file_id");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "bundles_created_by_idx" ON "bundles" USING btree ("created_by_id");
  CREATE INDEX "bundles_meta_meta_image_idx" ON "bundles" USING btree ("meta_image_id");
  CREATE INDEX "orders_created_by_idx" ON "orders" USING btree ("created_by_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_created_by_idx" ON "posts" USING btree ("created_by_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  ALTER TABLE "products" DROP COLUMN "owner";
  ALTER TABLE "products" DROP COLUMN "file_key";
  ALTER TABLE "products" DROP COLUMN "file_size";
  ALTER TABLE "products" DROP COLUMN "og_image_id";
  ALTER TABLE "bundles" DROP COLUMN "og_image_id";
  ALTER TABLE "orders" DROP COLUMN "owner_attribution";
  ALTER TABLE "posts" DROP COLUMN "author";
  ALTER TABLE "posts" DROP COLUMN "og_image_id";
  DROP TYPE "public"."enum_products_owner";
  DROP TYPE "public"."enum_orders_owner_attribution";
  DROP TYPE "public"."enum_posts_author";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_owner" AS ENUM('ME', 'PARTNER');
  CREATE TYPE "public"."enum_orders_owner_attribution" AS ENUM('ME', 'PARTNER');
  CREATE TYPE "public"."enum_posts_author" AS ENUM('ME', 'PARTNER');
  ALTER TABLE "products" DROP CONSTRAINT "products_created_by_id_users_id_fk";
  
  ALTER TABLE "products" DROP CONSTRAINT "products_file_id_media_id_fk";
  
  ALTER TABLE "products" DROP CONSTRAINT "products_meta_image_id_media_id_fk";
  
  ALTER TABLE "bundles" DROP CONSTRAINT "bundles_created_by_id_users_id_fk";
  
  ALTER TABLE "bundles" DROP CONSTRAINT "bundles_meta_image_id_media_id_fk";
  
  ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_id_users_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_category_id_categories_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_created_by_id_users_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_meta_image_id_media_id_fk";
  
  ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_posts_status";
  CREATE TYPE "public"."enum_posts_status" AS ENUM('active', 'draft', 'archived');
  ALTER TABLE "posts" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_posts_status";
  ALTER TABLE "posts" ALTER COLUMN "status" SET DATA TYPE "public"."enum_posts_status" USING "status"::"public"."enum_posts_status";
  DROP INDEX "products_created_by_idx";
  DROP INDEX "products_file_idx";
  DROP INDEX "products_meta_meta_image_idx";
  DROP INDEX "bundles_created_by_idx";
  DROP INDEX "bundles_meta_meta_image_idx";
  DROP INDEX "orders_created_by_idx";
  DROP INDEX "posts_category_idx";
  DROP INDEX "posts_created_by_idx";
  DROP INDEX "posts_meta_meta_image_idx";
  ALTER TABLE "products" ADD COLUMN "owner" "enum_products_owner" DEFAULT 'ME' NOT NULL;
  ALTER TABLE "products" ADD COLUMN "file_key" varchar NOT NULL;
  ALTER TABLE "products" ADD COLUMN "file_size" numeric;
  ALTER TABLE "products" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "bundles" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "orders" ADD COLUMN "owner_attribution" "enum_orders_owner_attribution" NOT NULL;
  ALTER TABLE "posts" ADD COLUMN "author" "enum_posts_author" DEFAULT 'ME' NOT NULL;
  ALTER TABLE "posts" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "products" ADD CONSTRAINT "products_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles" ADD CONSTRAINT "bundles_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_og_image_idx" ON "products" USING btree ("og_image_id");
  CREATE INDEX "bundles_og_image_idx" ON "bundles" USING btree ("og_image_id");
  CREATE INDEX "posts_og_image_idx" ON "posts" USING btree ("og_image_id");
  ALTER TABLE "products" DROP COLUMN "created_by_id";
  ALTER TABLE "products" DROP COLUMN "file_id";
  ALTER TABLE "products" DROP COLUMN "meta_image_id";
  ALTER TABLE "bundles" DROP COLUMN "created_by_id";
  ALTER TABLE "bundles" DROP COLUMN "meta_image_id";
  ALTER TABLE "orders" DROP COLUMN "created_by_id";
  ALTER TABLE "posts" DROP COLUMN "category_id";
  ALTER TABLE "posts" DROP COLUMN "created_by_id";
  ALTER TABLE "posts" DROP COLUMN "meta_image_id";`)
}
