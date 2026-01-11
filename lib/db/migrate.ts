import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Run database migrations
 * Execute with: bun run lib/db/migrate.ts
 */
async function migrate() {
  console.log("🚀 Starting database migration...");

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Read the schema SQL file
    const schemaPath = join(process.cwd(), "lib/db/schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Remove comments and split by semicolons
    const cleanedSchema = schema
      .split("\n")
      .map((line) => {
        // Remove inline comments but keep the rest of the line
        const commentIndex = line.indexOf("--");
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join("\n");

    // Split by semicolons
    const statements = cleanedSchema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Found ${statements.length} statements to execute`);

    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      const preview = statement.substring(0, 60).replace(/\n/g, " ").replace(/\s+/g, " ");
      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        await sql.query(statement);
      } catch (err) {
        // Ignore "already exists" errors for IF NOT EXISTS statements
        const error = err as { code?: string; message?: string };
        if (
          error.code === "42P07" ||
          error.code === "42710" ||
          error.message?.includes("already exists")
        ) {
          console.log(`  ↳ Already exists, skipping`);
        } else {
          throw err;
        }
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
void migrate();
