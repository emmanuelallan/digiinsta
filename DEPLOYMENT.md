# Deployment Guide - Running Migrations on Neon Production Database

## Prerequisites

1. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
2. **Database Created**: Create a new project in Neon
3. **Connection String**: Get your Neon connection string

## Step 1: Get Your Neon Connection String

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click on "Connection Details"
4. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Set Up Environment Variables

### For Local Testing (Optional)

Create a `.env.production` file:

```bash
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### For Production Deployment (Vercel/Other)

Add the `DATABASE_URL` environment variable in your hosting platform:

**Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `DATABASE_URL` with your Neon connection string
4. Select "Production" environment

## Step 3: Run Migrations

### Option A: Run Locally Against Production Database

```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Run migrations
bun run db:migrate

# Or with npm
npm run db:migrate
```

### Option B: Run via Deployment Script

Create a migration script that runs during deployment:

1. Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "bun run db:migrate"
  }
}
```

**⚠️ Warning**: This will run migrations on every deployment. Better to run manually.

### Option C: Run Migrations via CI/CD

Create a GitHub Action (`.github/workflows/migrate.yml`):

```yaml
name: Run Database Migrations

on:
  workflow_dispatch:  # Manual trigger

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: bun run db:migrate
```

### Option D: Direct Connection via Neon CLI

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Run migrations directly
neonctl connection-string <project-id> | xargs -I {} env DATABASE_URL={} bun run db:migrate
```

## Step 4: Verify Migrations

### Check Migration Status

```bash
# Connect to your Neon database
psql "postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# List all tables
\dt

# Check specific tables
SELECT * FROM drizzle.__drizzle_migrations;
```

### Using Drizzle Studio

```bash
# Set DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

# Open Drizzle Studio
bun run db:studio
```

## Step 5: Generate New Migrations (When Schema Changes)

```bash
# 1. Update your schema in lib/db/schema.ts

# 2. Generate migration files
bun run db:generate

# 3. Review the generated migration in lib/db/migrations/

# 4. Run the migration
bun run db:migrate
```

## Common Issues & Solutions

### Issue 1: SSL Connection Error

**Error**: `no pg_hba.conf entry for host`

**Solution**: Ensure your connection string includes `?sslmode=require`:
```
postgresql://user:pass@host/db?sslmode=require
```

### Issue 2: Connection Timeout

**Error**: `Connection timeout`

**Solution**: 
- Check your Neon project is not suspended (free tier)
- Verify your IP is not blocked
- Ensure connection string is correct

### Issue 3: Permission Denied

**Error**: `permission denied for schema public`

**Solution**: Ensure your Neon user has proper permissions:
```sql
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

### Issue 4: Migration Already Applied

**Error**: `Migration already applied`

**Solution**: This is normal - migrations are idempotent. The migration system tracks what's been run.

## Best Practices

1. **Always Backup**: Neon provides automatic backups, but create a manual backup before major migrations
2. **Test Locally First**: Test migrations on a development branch in Neon
3. **Use Transactions**: Drizzle migrations are wrapped in transactions by default
4. **Version Control**: Always commit migration files to git
5. **Review Generated SQL**: Check the SQL in migration files before running
6. **Use Neon Branches**: Create a Neon branch for testing migrations

## Neon-Specific Features

### Create a Branch for Testing

```bash
# Install Neon CLI
npm install -g neonctl

# Create a branch
neonctl branches create --project-id <project-id> --name migration-test

# Get branch connection string
neonctl connection-string <project-id> --branch migration-test

# Test migrations on branch
DATABASE_URL="branch-connection-string" bun run db:migrate

# If successful, merge to main or run on production
```

### Monitor Database

- Use Neon Console to monitor:
  - Query performance
  - Connection count
  - Storage usage
  - Active queries

## Production Deployment Checklist

- [ ] Backup database (if needed)
- [ ] Test migrations on Neon branch
- [ ] Review all migration SQL files
- [ ] Set DATABASE_URL in production environment
- [ ] Run migrations: `bun run db:migrate`
- [ ] Verify tables created: Check Neon console or use `\dt`
- [ ] Test application functionality
- [ ] Monitor for errors in logs

## Quick Commands Reference

```bash
# Generate migration from schema changes
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio

# Connect to database directly
psql $DATABASE_URL

# List tables
psql $DATABASE_URL -c "\dt"

# Check migration history
psql $DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations;"
```

## Support

- **Neon Docs**: https://neon.tech/docs
- **Drizzle Docs**: https://orm.drizzle.team/docs/overview
- **Neon Discord**: https://discord.gg/neon
