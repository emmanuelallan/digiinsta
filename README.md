# Lemon Squeezy Admin Dashboard

A Next.js-based admin dashboard for managing and enhancing Lemon Squeezy products with custom taxonomy metadata. This application enables administrators to sync products from Lemon Squeezy, categorize them with custom taxonomies, and prepare them for display on a customer-facing storefront.

## Features

- **Email-based OTP Authentication** - Secure login with one-time passwords
- **Product Synchronization** - Sync products from Lemon Squeezy API
- **Product Enhancement** - Add custom taxonomy metadata to products
- **Taxonomy Management** - Create and manage product types, formats, occasions, and collections
- **Image Management** - View product images in an interactive carousel
- **Session Management** - Automatic session validation and refresh
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Accessibility** - WCAG 2.1 compliant with keyboard navigation and screen reader support

## Tech Stack

- **Framework:** Next.js 16.1.4 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Custom email-based OTP with session management
- **Email Service:** Resend
- **File Storage:** Cloudflare R2
- **UI Components:** shadcn/ui with Tailwind CSS
- **Package Manager:** Bun
- **Deployment:** Vercel

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- [Node.js](https://nodejs.org/) (v18 or higher) - for compatibility

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/digiinsta

# Lemon Squeezy API
LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id

# Resend Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Authentication
SESSION_COOKIE_NAME=digiinsta_session
SESSION_SECRET=your_session_secret_key_min_32_chars
SESSION_DURATION_HOURS=24
ALLOWED_ADMIN_EMAIL=digiinstastore@gmail.com

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Variable Details

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `LEMON_SQUEEZY_API_KEY` | API key from Lemon Squeezy dashboard | Yes |
| `LEMON_SQUEEZY_STORE_ID` | Your Lemon Squeezy store ID | Yes |
| `RESEND_API_KEY` | API key from Resend.com | Yes |
| `RESEND_FROM_EMAIL` | Verified sender email address | Yes |
| `SESSION_COOKIE_NAME` | Name for session cookie | No (default: digiinsta_session) |
| `SESSION_SECRET` | Secret key for session encryption (min 32 chars) | Yes |
| `SESSION_DURATION_HOURS` | Session validity duration in hours | No (default: 24) |
| `ALLOWED_ADMIN_EMAIL` | Email address allowed to login | Yes |
| `R2_ACCOUNT_ID` | Cloudflare account ID | Yes |
| `R2_ACCESS_KEY_ID` | R2 access key ID | Yes |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | Yes |
| `R2_BUCKET_NAME` | R2 bucket name for image storage | Yes |
| `R2_PUBLIC_URL` | Public URL for R2 bucket | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | No (default: http://localhost:3000) |

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd digiinsta
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Configure image domains (if needed):**
   
   The `next.config.ts` file is already configured to allow images from:
   - `cdn.lemonsqueezy.com` (Lemon Squeezy product images)
   - `*.r2.dev` (Cloudflare R2 taxonomy images)
   
   If you use a custom R2 domain, update `next.config.ts`:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'your-custom-domain.com',
         pathname: '/**',
       },
     ],
   }
   ```

5. **Set up the database:**
   ```bash
   # Generate migration files (if schema changed)
   bun run db:generate
   
   # Run migrations
   bun run db:migrate
   ```

6. **Start the development server:**
   ```bash
   bun run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)

## Database Setup

### Local Development

1. **Install PostgreSQL:**
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create database:**
   ```bash
   createdb digiinsta
   ```

3. **Run migrations:**
   ```bash
   bun run db:migrate
   ```

### Database Commands

```bash
# Generate new migration after schema changes
bun run db:generate

# Run pending migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Usage

### Authentication

1. Navigate to `/admin`
2. Enter the authorized email address (configured in `ALLOWED_ADMIN_EMAIL`)
3. Check your email for the 6-digit OTP code
4. Enter the OTP to login
5. You'll be redirected to the dashboard

### Product Synchronization

1. Click the "Resync Products" button on the dashboard
2. Wait for the sync to complete
3. View the success message with counts of new/skipped products
4. Products will appear in the product list

### Product Enhancement

1. Click on a product card in the dashboard
2. View product details and images
3. Select taxonomies:
   - **Product Type** (single selection)
   - **Formats** (multiple selection)
   - **Occasion** (single selection)
   - **Collection** (single selection)
4. Click "Save" to persist changes
5. Product will be marked as "Enhanced"

### Creating Taxonomies

1. On the product edit page, click the "+" button next to any taxonomy selector
2. Fill in the required fields:
   - **Simple Taxonomies** (Product Type, Format): Title only
   - **Complex Taxonomies** (Occasion, Collection): Title, description, and image
3. Click "Save" to create the taxonomy
4. The new taxonomy will immediately appear in the selector

## API Documentation

### Authentication Endpoints

#### POST /api/auth/send-otp
Send OTP to email address.

**Request:**
```json
{
  "email": "digiinstastore@gmail.com"
}
```

**Response:**
```json
{
  "success": true
}
```

#### POST /api/auth/verify-otp
Verify OTP and create session.

**Request:**
```json
{
  "email": "digiinstastore@gmail.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "..."
}
```

#### POST /api/auth/logout
Invalidate current session.

**Response:**
```json
{
  "success": true
}
```

#### GET /api/auth/session
Check session validity.

**Response:**
```json
{
  "valid": true,
  "email": "digiinstastore@gmail.com"
}
```

### Product Endpoints

#### POST /api/products/sync
Sync products from Lemon Squeezy.

**Response:**
```json
{
  "success": true,
  "newProductsCount": 5,
  "skippedProductsCount": 10,
  "errors": []
}
```

#### GET /api/products
Get all products with enhancement status.

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      "price": 29.99,
      "currency": "USD",
      "images": ["url1", "url2"],
      "isEnhanced": true
    }
  ]
}
```

#### GET /api/products/:id
Get single product with full details.

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "productType": { "id": "uuid", "title": "Digital" },
    "formats": [{ "id": "uuid", "title": "PDF" }],
    "occasion": { "id": "uuid", "title": "Birthday" },
    "collection": { "id": "uuid", "title": "Summer 2024" }
  }
}
```

#### PUT /api/products/:id/enhance
Update product taxonomies.

**Request:**
```json
{
  "productTypeId": "uuid",
  "formatIds": ["uuid1", "uuid2"],
  "occasionId": "uuid",
  "collectionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "product": { ... }
}
```

### Taxonomy Endpoints

#### POST /api/taxonomies/product-types
Create product type.

**Request:**
```json
{
  "title": "Digital Product"
}
```

**Response:**
```json
{
  "success": true,
  "productType": {
    "id": "uuid",
    "title": "Digital Product"
  }
}
```

#### POST /api/taxonomies/formats
Create format.

**Request:**
```json
{
  "title": "PDF"
}
```

#### POST /api/taxonomies/occasions
Create occasion (with image upload).

**Request:** FormData
- `title`: string
- `description`: string
- `image`: File

#### POST /api/taxonomies/collections
Create collection (with image upload).

**Request:** FormData
- `title`: string
- `description`: string
- `image`: File

#### GET /api/taxonomies/:type
Get all taxonomies of a specific type.

**Types:** `product_type`, `format`, `occasion`, `collection`

**Response:**
```json
{
  "success": true,
  "taxonomies": [
    {
      "id": "uuid",
      "title": "Title"
    }
  ]
}
```

## Project Structure

```
digiinsta/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin dashboard pages
│   │   ├── dashboard/            # Product list page
│   │   ├── products/[id]/        # Product edit page
│   │   ├── layout.tsx            # Admin layout with header
│   │   └── page.tsx              # Login page
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── products/             # Product endpoints
│   │   └── taxonomies/           # Taxonomy endpoints
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn UI components
│   ├── admin-header.tsx          # Admin navigation header
│   ├── breadcrumb.tsx            # Breadcrumb navigation
│   ├── error-boundary.tsx        # Error boundary component
│   ├── image-carousel.tsx        # Product image carousel
│   ├── pagination.tsx            # Pagination component
│   ├── taxonomy-dialog.tsx       # Taxonomy creation dialog
│   └── taxonomy-selector.tsx     # Taxonomy selector component
├── lib/                          # Library code
│   ├── auth/                     # Authentication services
│   │   ├── authentication-service.ts
│   │   ├── session-manager.ts
│   │   ├── use-session.ts
│   │   └── utils.ts
│   ├── db/                       # Database configuration
│   │   ├── migrations/           # Database migrations
│   │   ├── index.ts              # Database client
│   │   ├── migrate.ts            # Migration runner
│   │   └── schema.ts             # Drizzle schema
│   ├── email/                    # Email services
│   │   ├── email-service.ts
│   │   └── index.ts
│   ├── lemon-squeezy/            # Lemon Squeezy API client
│   │   ├── client.ts
│   │   └── index.ts
│   ├── products/                 # Product services
│   │   ├── product-enhancement-service.ts
│   │   ├── product-repository.ts
│   │   ├── product-sync-service.ts
│   │   ├── product-taxonomy-repository.ts
│   │   └── index.ts
│   ├── taxonomies/               # Taxonomy services
│   │   ├── taxonomy-repository.ts
│   │   ├── taxonomy-service.ts
│   │   ├── use-taxonomy-cache.ts
│   │   └── index.ts
│   └── utils.ts                  # Utility functions
├── .kiro/                        # Kiro spec files
│   └── specs/
│       └── lemon-squeezy-admin-dashboard/
│           ├── requirements.md
│           ├── design.md
│           ├── tasks.md
│           ├── INTEGRATION_TEST_RESULTS.md
│           └── PERFORMANCE_OPTIMIZATIONS.md
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── bun.lock                      # Bun lockfile
├── drizzle.config.ts             # Drizzle configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Package dependencies
├── README.md                     # This file
└── tsconfig.json                 # TypeScript configuration
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   bun add -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables:**
   - Go to your project settings on Vercel
   - Add all environment variables from `.env`
   - Redeploy the application

### Database Migration in Production

After deploying, run migrations on your production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your_production_database_url"

# Run migrations
bun run db:migrate
```

### Vercel Configuration

The project includes a `next.config.ts` file with optimized settings for Vercel deployment. No additional configuration is needed.

### Environment Variables on Vercel

Add the following environment variables in your Vercel project settings:

1. Go to Project Settings → Environment Variables
2. Add all variables from your `.env` file
3. Set the environment (Production, Preview, Development)
4. Save and redeploy

## Performance Optimizations

The application includes several performance optimizations:

- **Image Optimization:** Next.js Image component with lazy loading
- **Pagination:** Client-side pagination for large product lists (12 per page)
- **Taxonomy Caching:** 5-minute cache for taxonomy data
- **Database Indexes:** Optimized queries with proper indexes
- **Code Splitting:** Automatic code splitting by Next.js

For detailed information, see [PERFORMANCE_OPTIMIZATIONS.md](.kiro/specs/lemon-squeezy-admin-dashboard/PERFORMANCE_OPTIMIZATIONS.md)

## Testing

Integration test results are available in [INTEGRATION_TEST_RESULTS.md](.kiro/specs/lemon-squeezy-admin-dashboard/INTEGRATION_TEST_RESULTS.md)

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `createdb digiinsta`
4. Check PostgreSQL logs for errors

### OTP Email Not Received

**Problem:** OTP email not arriving

**Solution:**
1. Check RESEND_API_KEY is valid
2. Verify RESEND_FROM_EMAIL is verified in Resend dashboard
3. Check spam folder
4. Verify email address matches ALLOWED_ADMIN_EMAIL

### Session Expired Immediately

**Problem:** Session expires right after login

**Solution:**
1. Check SESSION_SECRET is set and at least 32 characters
2. Verify SESSION_DURATION_HOURS is set correctly
3. Clear browser cookies and try again
4. Check server time is correct

### Product Sync Fails

**Problem:** Product sync returns errors

**Solution:**
1. Verify LEMON_SQUEEZY_API_KEY is valid
2. Check LEMON_SQUEEZY_STORE_ID is correct
3. Ensure API key has proper permissions
4. Check Lemon Squeezy API status

### Image Upload Fails

**Problem:** Cannot upload taxonomy images

**Solution:**
1. Verify R2 credentials are correct
2. Check R2_BUCKET_NAME exists
3. Ensure bucket has public read access
4. Verify image is under 5MB and valid format (JPEG, PNG, WebP)

### Next.js Image Error

**Problem:** Error: "hostname is not configured under images"

**Solution:**
1. Check `next.config.ts` has correct image domains configured
2. Ensure Lemon Squeezy CDN is allowed: `cdn.lemonsqueezy.com`
3. Ensure R2 domain is allowed: `*.r2.dev` or your custom domain
4. Restart development server after config changes: `bun run dev`
5. Redeploy if in production

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved

## Support

For support, email: digiinstastore@gmail.com

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Lemon Squeezy](https://www.lemonsqueezy.com/) - Payment platform
- [Resend](https://resend.com/) - Email service
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Object storage
