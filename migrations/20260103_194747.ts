import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add columns with default value first, then remove default
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN "price" numeric DEFAULT 0;
    ALTER TABLE "products" ADD COLUMN "compare_at_price" numeric;
    ALTER TABLE "bundles" ADD COLUMN "price" numeric DEFAULT 0;
    ALTER TABLE "bundles" ADD COLUMN "compare_at_price" numeric;
  `);

  // Set NOT NULL constraint after adding default values
  await db.execute(sql`
    ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;
    ALTER TABLE "bundles" ALTER COLUMN "price" SET NOT NULL;
  `);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "price";
  ALTER TABLE "products" DROP COLUMN "compare_at_price";
  ALTER TABLE "bundles" DROP COLUMN "price";
  ALTER TABLE "bundles" DROP COLUMN "compare_at_price";`);
}
