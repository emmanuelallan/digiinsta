# Design Document: Sanity Migration

## Overview

This design document outlines the architecture and implementation for migrating DigiInsta from Payload CMS to Sanity CMS. The migration follows a three-tier architecture:

1. **Sanity** - Content management (products, categories, blog, images)
2. **Neon PostgreSQL** - Transactional data (orders, analytics, sessions)
3. **Cloudflare R2** - Large file storage (product downloads up to 100MB)

The design prioritizes SEO, cost efficiency (staying within free tiers), and developer experience.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS APPLICATION (Vercel)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Frontend   │  │   API       │  │  Webhooks   │  │   Admin    │ │
│  │  (SSG/ISR)  │  │  Routes     │  │  Handlers   │  │   Auth     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
└─────────┼────────────────┼────────────────┼───────────────┼────────┘
          │                │                │               │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐   ┌─────▼─────┐
    │  SANITY   │    │   NEON    │    │  POLAR    │   │  RESEND   │
    │  (CMS)    │    │ (Postgres)│    │ (Payments)│   │  (Email)  │
    └─────┬─────┘    └───────────┘    └───────────┘   └───────────┘
          │
    ┌─────▼─────┐
    │    R2     │
    │ (Storage) │
    └───────────┘
```

### Data Flow

1. **Content Creation**: Admin → Sanity Studio → Sanity CDN
2. **File Upload**: Admin → API Route → R2 (presigned URL)
3. **Checkout**: Customer → Polar → Webhook → Neon (order record)
4. **Download**: Customer → API Route → R2 (presigned URL)
5. **Analytics**: Neon queries → Aggregated metrics

## Components and Interfaces

### Sanity Client Configuration

```typescript
// lib/sanity/client.ts
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: true, // Use CDN for read operations
});

// Write client for mutations (server-side only)
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: SanityImageSource) => builder.image(source);
```

### Neon Database Client

```typescript
// lib/db/client.ts
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
```

### R2 Storage Client

```typescript
// lib/storage/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}
```

### Price Resolution Service

```typescript
// lib/pricing/resolver.ts
interface PriceResult {
  price: number;
  compareAtPrice: number | null;
  isOnSale: boolean;
  savings: number | null;
  savingsPercentage: number | null;
}

export function resolveProductPrice(
  product: { customPrice?: number; compareAtPrice?: number },
  subcategory: { defaultPrice: number; compareAtPrice?: number }
): PriceResult {
  const price = product.customPrice ?? subcategory.defaultPrice;
  const compareAtPrice = product.compareAtPrice ?? subcategory.compareAtPrice ?? null;
  const isOnSale = compareAtPrice !== null && compareAtPrice > price;
  const savings = isOnSale ? compareAtPrice - price : null;
  const savingsPercentage = isOnSale ? Math.round((savings! / compareAtPrice!) * 100) : null;

  return { price, compareAtPrice, isOnSale, savings, savingsPercentage };
}
```

## Data Models

### Sanity Schemas

#### Category Schema

```typescript
// sanity/schemas/category.ts
export default {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    },
    { name: "description", type: "text" },
    { name: "image", type: "image", options: { hotspot: true } },
    {
      name: "icon",
      type: "string",
      options: { list: ["Microscope", "ChartLine", "Sparkles", "Palette", "Workflow", "Folder"] },
    },
    { name: "gradient", type: "string", options: { list: gradientOptions } },
    { name: "displayOrder", type: "number", initialValue: 0 },
    {
      name: "status",
      type: "string",
      options: { list: ["active", "archived"] },
      initialValue: "active",
    },
    // SEO fields
    { name: "metaTitle", type: "string" },
    { name: "metaDescription", type: "text" },
  ],
  orderings: [
    {
      title: "Display Order",
      name: "displayOrder",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
};
```

#### Subcategory Schema

```typescript
// sanity/schemas/subcategory.ts
export default {
  name: "subcategory",
  title: "Subcategory",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    },
    { name: "description", type: "text" },
    {
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "defaultPrice",
      type: "number",
      description: "Price in cents",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "compareAtPrice",
      type: "number",
      description: "Original price in cents for sale display",
    },
    {
      name: "status",
      type: "string",
      options: { list: ["active", "archived"] },
      initialValue: "active",
    },
    // SEO fields
    { name: "metaTitle", type: "string" },
    { name: "metaDescription", type: "text" },
  ],
};
```

#### Product Schema

```typescript
// sanity/schemas/product.ts
export default {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    },
    { name: "description", type: "blockContent" },
    { name: "shortDescription", type: "text", rows: 3 },
    {
      name: "subcategory",
      type: "reference",
      to: [{ type: "subcategory" }],
      validation: (Rule) => Rule.required(),
    },
    { name: "creator", type: "reference", to: [{ type: "creator" }] },
    { name: "polarProductId", type: "string", validation: (Rule) => Rule.required() },
    { name: "customPrice", type: "number", description: "Override subcategory price (in cents)" },
    {
      name: "compareAtPrice",
      type: "number",
      description: "Original price for sale display (in cents)",
    },
    { name: "images", type: "array", of: [{ type: "image", options: { hotspot: true } }] },
    { name: "productFileKey", type: "string", description: "R2 file key for download" },
    { name: "productFileName", type: "string", description: "Original filename for display" },
    { name: "productFileSize", type: "number", description: "File size in bytes" },
    {
      name: "status",
      type: "string",
      options: { list: ["active", "draft", "archived"] },
      initialValue: "draft",
    },
    { name: "tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } },
    {
      name: "targetGroups",
      type: "array",
      of: [{ type: "reference", to: [{ type: "targetGroup" }] }],
    },
    // SEO fields
    { name: "metaTitle", type: "string" },
    { name: "metaDescription", type: "text" },
  ],
  preview: {
    select: { title: "title", subtitle: "subcategory.title", media: "images.0" },
  },
};
```

#### Creator Schema

```typescript
// sanity/schemas/creator.ts
export default {
  name: "creator",
  title: "Creator",
  type: "document",
  fields: [
    { name: "name", type: "string", validation: (Rule) => Rule.required() },
    { name: "email", type: "string", validation: (Rule) => Rule.required().email() },
    {
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    },
    { name: "bio", type: "text" },
    {
      name: "status",
      type: "string",
      options: { list: ["active", "inactive"] },
      initialValue: "active",
    },
  ],
};
```

#### Bundle Schema

```typescript
// sanity/schemas/bundle.ts
export default {
  name: "bundle",
  title: "Bundle",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    },
    { name: "description", type: "blockContent" },
    { name: "shortDescription", type: "text", rows: 3 },
    {
      name: "products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (Rule) => Rule.required().min(2),
    },
    { name: "polarProductId", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "price",
      type: "number",
      description: "Bundle price in cents",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "compareAtPrice",
      type: "number",
      description: "Sum of individual prices for savings display",
    },
    { name: "heroImage", type: "image", options: { hotspot: true } },
    {
      name: "status",
      type: "string",
      options: { list: ["active", "draft", "archived"] },
      initialValue: "draft",
    },
    // SEO fields
    { name: "metaTitle", type: "string" },
    { name: "metaDescription", type: "text" },
  ],
};
```

#### Post Schema

```typescript
// sanity/schemas/post.ts
export default {
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    { name: "title", type: "string", validation: (Rule) => Rule.required() },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    },
    { name: "content", type: "blockContent", validation: (Rule) => Rule.required() },
    { name: "excerpt", type: "text", rows: 3 },
    { name: "coverImage", type: "image", options: { hotspot: true } },
    { name: "category", type: "reference", to: [{ type: "postCategory" }] },
    { name: "author", type: "string" },
    { name: "publishedAt", type: "datetime" },
    {
      name: "status",
      type: "string",
      options: { list: ["published", "draft", "archived"] },
      initialValue: "draft",
    },
    // SEO fields
    { name: "metaTitle", type: "string" },
    { name: "metaDescription", type: "text" },
  ],
};
```

### Neon PostgreSQL Schema

```sql
-- Orders table (from Polar webhooks)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  polar_order_id VARCHAR(255) UNIQUE NOT NULL,
  polar_checkout_id VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount INTEGER NOT NULL, -- cents
  currency VARCHAR(10) DEFAULT 'usd',
  fulfilled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items with creator attribution
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL, -- 'product' or 'bundle'
  sanity_id VARCHAR(255) NOT NULL, -- Sanity document ID
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL, -- cents
  creator_sanity_id VARCHAR(255), -- Creator's Sanity ID for revenue tracking
  file_key VARCHAR(255), -- R2 file key
  max_downloads INTEGER DEFAULT 5,
  downloads_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'add_to_cart', 'purchase'
  sanity_id VARCHAR(255) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin sessions (OTP-based)
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255),
  otp_expires_at TIMESTAMP,
  session_token VARCHAR(255) UNIQUE,
  session_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Creator report tokens
CREATE TABLE creator_report_tokens (
  id SERIAL PRIMARY KEY,
  creator_sanity_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_sanity_id ON order_items(sanity_id);
CREATE INDEX idx_order_items_creator ON order_items(creator_sanity_id);
CREATE INDEX idx_analytics_sanity_id ON analytics_events(sanity_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Slug Generation Produces Valid URLs

_For any_ title string, the generateSlug function SHALL produce a string that:

- Contains only lowercase letters, numbers, and hyphens
- Does not start or end with a hyphen
- Does not contain consecutive hyphens
- Is non-empty for non-empty input

**Validates: Requirements 1.2, 3.5, 5.3, 7.3**

### Property 2: Price Inheritance Resolution

_For any_ product with a subcategory reference:

- If product.customPrice is defined, effectivePrice equals product.customPrice
- If product.customPrice is undefined, effectivePrice equals subcategory.defaultPrice
- The resolved price is always a non-negative integer

**Validates: Requirements 2.3, 3.2, 3.3**

### Property 3: Sale Detection Accuracy

_For any_ product or bundle with price and compareAtPrice:

- isOnSale is true if and only if compareAtPrice > effectivePrice
- savings equals compareAtPrice - effectivePrice when on sale
- savingsPercentage equals round((savings / compareAtPrice) \* 100) when on sale

**Validates: Requirements 5.2, 6.6, 11.5**

### Property 4: Creator Revenue Calculation

_For any_ completed order with creator-attributed items:

- Creator revenue share equals exactly 50% of the item price
- For bundles, revenue is split proportionally among product creators
- Total creator payouts never exceed 50% of order total

**Validates: Requirements 4.3, 5.4**

### Property 5: Download Limit Enforcement

_For any_ order item with download tracking:

- downloadsUsed increments by 1 on each successful download
- Download is blocked when downloadsUsed >= maxDownloads
- downloadsUsed never exceeds maxDownloads

**Validates: Requirements 6.3, 12.3, 12.4**

### Property 6: New Arrivals Date Filtering

_For any_ product, isNewArrival is true if and only if:

- (currentDate - product.\_createdAt) <= 30 days
- Product status is 'active'

**Validates: Requirements 6.5, 11.3**

### Property 7: Admin Authentication Authorization

_For any_ login attempt with email:

- Login succeeds only if email is in ['imma.allan@gmail.com', 'mburuhildah2@gmail.com']
- Valid OTP is required (matches stored hash and not expired)
- Session is created only after successful OTP validation

**Validates: Requirements 8.1, 8.3, 8.5**

### Property 8: SEO Meta Generation

_For any_ content document (product, category, post, bundle):

- Generated meta title is non-empty (falls back to document title)
- Generated meta description is non-empty (falls back to short description or excerpt)
- JSON-LD contains required schema.org fields for the content type

**Validates: Requirements 7.5, 9.2, 9.3, 9.5, 15.2**

### Property 9: Sorting Consistency

_For any_ sortable collection query:

- Categories are ordered by displayOrder ascending
- Hero slides are ordered by displayOrder ascending
- New arrivals are ordered by \_createdAt descending
- Best sellers are ordered by sales count descending

**Validates: Requirements 2.5, 11.3, 11.4, 14.2**

### Property 10: Related Products Relevance

_For any_ product, related products include only items that:

- Share the same subcategory, OR
- Have at least one overlapping tag
- Exclude the source product itself
- Have status 'active'

**Validates: Requirements 11.2**

### Property 11: Presigned URL Expiration

_For any_ generated download URL:

- URL is valid for exactly 1 hour from generation time
- URL becomes invalid after expiration
- URL grants read-only access to the specific file

**Validates: Requirements 12.2**

### Property 12: Creator Report Token Expiration

_For any_ generated creator report token:

- Token expires at the specified expiration time
- Expired tokens are rejected
- Token grants access only to the specific creator's data

**Validates: Requirements 4.4**

## Error Handling

### Sanity Query Errors

- Implement retry logic with exponential backoff (3 attempts)
- Fall back to cached data when available
- Log errors to Sentry for monitoring
- Display user-friendly error messages

### Neon Database Errors

- Use connection pooling to handle connection limits
- Implement transaction rollback on failures
- Queue failed webhook processing for retry

### R2 Storage Errors

- Validate file existence before generating presigned URLs
- Handle expired URLs gracefully with re-generation
- Implement upload retry for failed uploads

### Polar Webhook Errors

- Verify webhook signatures before processing
- Idempotent order creation (check polar_order_id uniqueness)
- Queue failed webhooks for manual review

### Authentication Errors

- Rate limit OTP requests (5 per hour per email)
- Clear expired sessions automatically
- Log failed login attempts for security monitoring

## Testing Strategy

### Unit Tests (Vitest + Bun)

- Price resolution logic
- Slug generation
- Revenue calculation
- Date filtering (new arrivals)
- Meta generation

### Property-Based Tests (fast-check)

- Slug generation validity (Property 1)
- Price inheritance (Property 2)
- Sale detection (Property 3)
- Revenue calculation (Property 4)
- Download limits (Property 5)

### Integration Tests

- Sanity query functions
- Neon database operations
- R2 presigned URL generation
- Polar webhook handling

### E2E Tests (Playwright - optional)

- Checkout flow
- Download flow
- Admin authentication

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### Pre-commit Checks

```bash
bun run typecheck && bun run lint && bun run test && bun run build
```
