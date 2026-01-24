# Database Setup

This directory contains the database schema, migrations, and connection setup for the Lemon Squeezy Admin Dashboard.

## Structure

- `schema.ts` - Drizzle ORM schema definitions for all database tables
- `index.ts` - Database connection and client export
- `migrate.ts` - Migration runner script
- `migrations/` - Generated SQL migration files

## Tables

### Products
- Stores synced products from Lemon Squeezy API
- Includes product details, images, and taxonomy associations

### Taxonomies
- **Product Types** (simple taxonomy) - Product categorization
- **Formats** (simple taxonomy) - Product format types
- **Occasions** (complex taxonomy) - Occasion categories with images
- **Collections** (complex taxonomy) - Product collections with images

### Authentication
- **Sessions** - User session management
- **OTPs** - One-time passwords for email authentication

### Associations
- **Product Formats** - Many-to-many relationship between products and formats

## Scripts

```bash
# Generate new migration after schema changes
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@host:port/database"
```
