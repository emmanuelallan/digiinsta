# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Lemon Squeezy Admin Dashboard to production using Vercel and Neon PostgreSQL.

## Prerequisites

Before deploying, ensure you have:

- [x] Vercel account (free tier is sufficient)
- [x] Neon PostgreSQL account (free tier is sufficient)
- [x] Cloudflare account with R2 storage
- [x] Resend account for email delivery
- [x] Lemon Squeezy API credentials
- [x] Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Database Setup (Neon PostgreSQL)

### 1.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click "Create Project"
3. Configure project:
   - **Name:** digiinsta-production
   - **Region:** Choose closest to your users
   - **PostgreSQL Version:** 16 (recommended)
4. Click "Create Project"

### 1.2 Get Connection String

1. In your Neon project dashboard, click "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this for later use in environment variables

### 1.3 Configure Database

Neon automatically creates a database. No additional configuration needed.

## Step 2: Cloudflare R2 Setup

### 2.1 Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 Object Storage
3. Click "Create bucket"
4. Configure bucket:
   - **Name:** digiinsta-images
   - **Location:** Automatic (recommended)
5. Click "Create bucket"

### 2.2 Configure Public Access

1. Go to bucket settings
2. Enable "Public Access"
3. Note the public URL (e.g., `https://pub-xxx.r2.dev`)

### 2.3 Create API Token

1. Go to R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Configure token:
   - **Name:** digiinsta-production
   - **Permissions:** Object Read & Write
   - **Bucket:** digiinsta-images
4. Click "Create API Token"
5. Save the credentials:
   - Access Key ID
   - Secret Access Key
   - Account ID

## Step 3: Resend Email Setup

### 3.1 Create Resend Account

1. Go to [Resend](https://resend.com/)
2. Sign up for a free account
3. Verify your email address

### 3.2 Add Domain

1. Go to Domains → Add Domain
2. Enter your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend to your domain
4. Wait for verification (usually 5-10 minutes)

### 3.3 Create API Key

1. Go to API Keys → Create API Key
2. Configure key:
   - **Name:** digiinsta-production
   - **Permission:** Full Access
3. Click "Create"
4. Copy and save the API key

### 3.4 Configure Sender Email

Use a verified email address from your domain:
- Format: `noreply@yourdomain.com`
- Must be from verified domain

## Step 4: Vercel Deployment

### 4.1 Push Code to Git

1. Initialize git repository (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create GitHub repository and push:
   ```bash
   git remote add origin https://github.com/yourusername/digiinsta.git
   git branch -M main
   git push -u origin main
   ```

### 4.2 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `bun run build`
   - **Output Directory:** .next
   - **Install Command:** `bun install`

### 4.3 Configure Environment Variables

Add the following environment variables in Vercel:

#### Database
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

#### Lemon Squeezy
```
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
```

#### Resend Email
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Authentication
```
SESSION_COOKIE_NAME=digiinsta_session
SESSION_SECRET=your_random_32_character_secret_key_here
SESSION_DURATION_HOURS=24
ALLOWED_ADMIN_EMAIL=digiinstastore@gmail.com
```

#### Cloudflare R2
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=digiinsta-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

#### Next.js
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Important:** Set all variables for "Production", "Preview", and "Development" environments.

### 4.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (usually 2-3 minutes)
3. Vercel will provide a deployment URL

## Step 5: Run Database Migrations

### 5.1 Install Vercel CLI

```bash
bun add -g vercel
```

### 5.2 Login to Vercel

```bash
vercel login
```

### 5.3 Link Project

```bash
vercel link
```

### 5.4 Pull Environment Variables

```bash
vercel env pull .env.production
```

### 5.5 Run Migrations

```bash
# Set production database URL
export DATABASE_URL="your_production_database_url"

# Run migrations
bun run db:migrate
```

**Alternative:** Use Vercel CLI to run migrations:

```bash
vercel env pull
bun run db:migrate
```

## Step 6: Verify Deployment

### 6.1 Test Authentication

1. Navigate to `https://your-domain.vercel.app/admin`
2. Enter the authorized email address
3. Check email for OTP
4. Verify login works

### 6.2 Test Product Sync

1. Login to dashboard
2. Click "Resync Products"
3. Verify products are synced from Lemon Squeezy

### 6.3 Test Product Enhancement

1. Click on a product
2. Add taxonomies
3. Upload an image for complex taxonomy
4. Save and verify

### 6.4 Test Image Upload

1. Create a new occasion or collection
2. Upload an image
3. Verify image appears in R2 bucket
4. Verify image loads on page

## Step 7: Custom Domain (Optional)

### 7.1 Add Domain to Vercel

1. Go to Project Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `admin.yourdomain.com`)
4. Click "Add"

### 7.2 Configure DNS

Add the DNS records provided by Vercel to your domain:

**A Record:**
```
Type: A
Name: admin (or @)
Value: 76.76.21.21
```

**CNAME Record (alternative):**
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### 7.3 Wait for Verification

DNS propagation can take 24-48 hours. Vercel will automatically provision SSL certificate.

### 7.4 Update Environment Variable

Update `NEXT_PUBLIC_APP_URL` to your custom domain:
```
NEXT_PUBLIC_APP_URL=https://admin.yourdomain.com
```

## Step 8: Post-Deployment Configuration

### 8.1 Set Up Monitoring

1. Enable Vercel Analytics:
   - Go to Project Settings → Analytics
   - Enable Web Analytics
   - Enable Speed Insights

2. Set up error tracking (optional):
   - Install Sentry or similar
   - Add DSN to environment variables

### 8.2 Configure Cron Jobs

Set up cron jobs for maintenance tasks:

**Session Cleanup (Daily):**
```bash
# Add to Vercel Cron Jobs
0 0 * * * curl -X POST https://your-domain.vercel.app/api/auth/cleanup-sessions
```

**Alternative:** Use Vercel Cron (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/auth/cleanup-sessions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 8.3 Set Up Backups

**Neon Automatic Backups:**
- Neon automatically backs up your database
- Retention: 7 days (free tier), 30 days (paid)
- No configuration needed

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Step 9: Security Checklist

- [x] All environment variables are set correctly
- [x] SESSION_SECRET is at least 32 characters and random
- [x] Database connection uses SSL (`?sslmode=require`)
- [x] R2 bucket has appropriate CORS settings
- [x] Resend domain is verified
- [x] ALLOWED_ADMIN_EMAIL is set correctly
- [x] HTTPS is enabled (automatic with Vercel)
- [x] Session cookies are HttpOnly and Secure
- [x] No sensitive data in client-side code

## Step 10: Performance Optimization

### 10.1 Enable Vercel Edge Network

Vercel automatically uses Edge Network. No configuration needed.

### 10.2 Configure Caching

Add caching headers in `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/taxonomies/:type',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};
```

### 10.3 Enable Image Optimization

Vercel automatically optimizes images. Ensure you're using Next.js Image component.

## Troubleshooting

### Build Fails

**Problem:** Build fails with "Module not found"

**Solution:**
1. Check `package.json` dependencies
2. Run `bun install` locally
3. Commit `bun.lock` file
4. Redeploy

### Database Connection Error

**Problem:** Cannot connect to database

**Solution:**
1. Verify DATABASE_URL is correct
2. Check Neon project is active
3. Ensure `?sslmode=require` is in connection string
4. Check Neon IP allowlist (if configured)

### OTP Email Not Sending

**Problem:** OTP emails not arriving

**Solution:**
1. Verify Resend API key is correct
2. Check domain is verified in Resend
3. Verify RESEND_FROM_EMAIL matches verified domain
4. Check Resend dashboard for delivery logs

### Image Upload Fails

**Problem:** Cannot upload taxonomy images

**Solution:**
1. Verify R2 credentials are correct
2. Check R2 bucket exists
3. Ensure bucket has public access enabled
4. Verify CORS settings on R2 bucket

### Next.js Image Error

**Problem:** Error: "hostname is not configured under images"

**Solution:**
1. Check `next.config.ts` has correct image domains configured:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'cdn.lemonsqueezy.com',
         pathname: '/media/**',
       },
       {
         protocol: 'https',
         hostname: '**.r2.dev',
         pathname: '/**',
       },
     ],
   }
   ```
2. If using custom R2 domain, add it to remotePatterns
3. Restart development server: `bun run dev`
4. Redeploy to Vercel if in production

### Session Expires Immediately

**Problem:** Session expires right after login

**Solution:**
1. Check SESSION_SECRET is set and at least 32 characters
2. Verify SESSION_DURATION_HOURS is set
3. Check server time is correct
4. Clear browser cookies and try again

## Rollback Procedure

If deployment fails or has issues:

1. **Rollback in Vercel:**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Rollback Database:**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup.sql
   ```

3. **Rollback Code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Maintenance

### Regular Tasks

**Weekly:**
- Check Vercel Analytics for errors
- Review Neon database usage
- Check R2 storage usage

**Monthly:**
- Review and rotate API keys
- Check for dependency updates
- Review error logs

**Quarterly:**
- Audit security settings
- Review and optimize database queries
- Check for Next.js updates

### Updating Dependencies

```bash
# Check for updates
bun outdated

# Update dependencies
bun update

# Test locally
bun run dev
bun run build

# Deploy
git add .
git commit -m "Update dependencies"
git push origin main
```

## Support

For deployment support:
- **Vercel:** https://vercel.com/support
- **Neon:** https://neon.tech/docs
- **Cloudflare:** https://developers.cloudflare.com/r2/
- **Resend:** https://resend.com/docs

For application support:
- Email: digiinstastore@gmail.com

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Resend Documentation](https://resend.com/docs)
