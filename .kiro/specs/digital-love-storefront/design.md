# Design Document: Digital Love Storefront

## Overview

The Digital Love Storefront is a conversion-focused e-commerce web application built with Next.js, designed to sell digital relationship products through an emotionally engaging, minimal interface. The storefront prioritizes simplicity, fast performance, and direct checkout integration with Lemon Squeezy for instant digital delivery.

The design follows a mobile-first approach with a calm, premium aesthetic inspired by Apple and BestSelf, using soft colors, clear typography, and emotional copy to guide visitors from discovery to purchase.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (existing, synced with Lemon Squeezy)
- **Payment**: Lemon Squeezy Checkout Overlay
- **Image Optimization**: Next.js Image component
- **Deployment**: Vercel (recommended for Next.js)

### Application Structure

```
app/
├── (storefront)/
│   ├── page.tsx                    # Homepage
│   ├── collections/
│   │   └── [slug]/
│   │       └── page.tsx            # Collection pages
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx            # Product detail pages
│   └── thank-you/
│       └── page.tsx                # Post-purchase page
├── api/
│   └── email-subscribe/
│       └── route.ts                # Email capture endpoint
└── layout.tsx                      # Root layout with header/footer

components/
├── homepage/
│   ├── HeroSection.tsx
│   ├── CollectionCards.tsx
│   ├── ValentineHighlight.tsx
│   ├── HowItWorks.tsx
│   ├── BestSellers.tsx
│   ├── WhyPeopleLove.tsx
│   └── EmailCapture.tsx
├── collections/
│   ├── CollectionHero.tsx
│   ├── ProductGrid.tsx
│   └── FilterSort.tsx
├── products/
│   ├── ImageCarousel.tsx
│   ├── ProductInfo.tsx
│   ├── BuyNowButton.tsx
│   ├── WhatsIncluded.tsx
│   ├── WhyItWorks.tsx
│   ├── HowToUse.tsx
│   ├── RelatedProducts.tsx
│   └── FAQ.tsx
├── shared/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── Badge.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    └── Card.tsx

lib/
├── db/
│   ├── products.ts                 # Product queries
│   ├── collections.ts              # Collection queries
│   └── email.ts                    # Email subscription
├── lemon-squeezy/
│   └── checkout.ts                 # Checkout URL generation
└── utils/
    ├── formatting.ts               # Price, text formatting
    └── validation.ts               # Email, input validation
```

### Data Flow

1. **Product Data**: Fetched from PostgreSQL database (synced from Lemon Squeezy admin)
2. **Filtering**: Server-side filtering by taxonomy (relationship type, occasion)
3. **Checkout**: Client-side redirect to Lemon Squeezy checkout overlay
4. **Email Capture**: API route stores emails in database

### Page Rendering Strategy

- **Homepage**: Server-side rendering (SSR) for fresh content
- **Collection Pages**: Server-side rendering with dynamic routes
- **Product Pages**: Server-side rendering with dynamic routes
- **Static Generation**: Consider ISR (Incremental Static Regeneration) for product pages if content is stable

## Components and Interfaces

### Core Data Models

```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  emotionalPromise: string;        // 1-2 sentence value prop
  price: number;
  salePrice?: number;
  images: ProductImage[];
  badges: Badge[];
  taxonomies: Taxonomy[];
  whatsIncluded: string[];
  whyItWorks: string[];
  howToUse: Step[];
  faqs: FAQ[];
  lemonSqueezyProductId: string;
  lemonSqueezyCheckoutUrl: string;
  variantId?: string;
}

interface ProductImage {
  url: string;
  alt: string;
  type: 'lifestyle' | 'overview' | 'sample' | 'editable' | 'printable' | 'gift';
  order: number;
}

interface Badge {
  text: string;
  type: 'bestseller' | 'valentine' | 'editable' | 'instant' | 'new';
  icon?: string;
}

interface Taxonomy {
  type: 'relationship' | 'occasion' | 'format';
  value: string;
}

interface Collection {
  slug: string;
  name: string;
  description: string;
  emotionalCopy: string;
  icon: string;
  taxonomyFilter: Taxonomy;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
  order: number;
}

interface EmailSubscription {
  email: string;
  subscribedAt: Date;
  source: 'homepage' | 'checkout';
}
```

### Component Interfaces

#### Homepage Components

```typescript
// HeroSection.tsx
interface HeroSectionProps {
  headline: string;
  subheadline: string;
  supportingText: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
  heroImage?: string;
}

// CollectionCards.tsx
interface CollectionCardsProps {
  collections: Collection[];
}

// ValentineHighlight.tsx
interface ValentineHighlightProps {
  featuredProducts: Product[];
}

// BestSellers.tsx
interface BestSellersProps {
  products: Product[];
}

// EmailCapture.tsx
interface EmailCaptureProps {
  onSubmit: (email: string) => Promise<void>;
}
```

#### Collection Page Components

```typescript
// CollectionHero.tsx
interface CollectionHeroProps {
  collection: Collection;
}

// ProductGrid.tsx
interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
}

// FilterSort.tsx
interface FilterSortProps {
  onFilterChange: (filter: FilterOptions) => void;
  onSortChange: (sort: SortOption) => void;
}

type SortOption = 'price-asc' | 'price-desc' | 'popularity' | 'newest';

interface FilterOptions {
  priceRange?: [number, number];
  badges?: Badge['type'][];
}
```

#### Product Detail Components

```typescript
// ImageCarousel.tsx
interface ImageCarouselProps {
  images: ProductImage[];
  productName: string;
}

// ProductInfo.tsx
interface ProductInfoProps {
  product: Product;
}

// BuyNowButton.tsx
interface BuyNowButtonProps {
  checkoutUrl: string;
  productName: string;
  onCheckoutOpen?: () => void;
}

// RelatedProducts.tsx
interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
}
```

### Database Queries

```typescript
// lib/db/products.ts
async function getProductBySlug(slug: string): Promise<Product | null>
async function getProductsByCollection(collectionSlug: string): Promise<Product[]>
async function getBestSellerProducts(limit: number): Promise<Product[]>
async function getRelatedProducts(productId: string, limit: number): Promise<Product[]>
async function getFeaturedProducts(occasion: string, limit: number): Promise<Product[]>

// lib/db/collections.ts
async function getAllCollections(): Promise<Collection[]>
async function getCollectionBySlug(slug: string): Promise<Collection | null>

// lib/db/email.ts
async function subscribeEmail(email: string, source: string): Promise<void>
async function isEmailSubscribed(email: string): Promise<boolean>
```

### Lemon Squeezy Integration

```typescript
// lib/lemon-squeezy/checkout.ts
function generateCheckoutUrl(productId: string, variantId?: string): string {
  // Returns Lemon Squeezy checkout URL with product/variant
  // Includes custom data for tracking and redirect URLs
}

function openCheckoutOverlay(checkoutUrl: string): void {
  // Opens Lemon Squeezy checkout in overlay mode
  // Handles post-purchase redirect
}
```

## Data Models

### Database Schema

The storefront reads from existing tables synced with Lemon Squeezy:

```sql
-- Products table (existing, synced from Lemon Squeezy)
products (
  id UUID PRIMARY KEY,
  lemon_squeezy_id VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  emotional_promise TEXT,
  price DECIMAL NOT NULL,
  sale_price DECIMAL,
  checkout_url TEXT NOT NULL,
  variant_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Product images
product_images (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  type VARCHAR NOT NULL,  -- lifestyle, overview, sample, etc.
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP
)

-- Product taxonomies (for filtering)
product_taxonomies (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  taxonomy_type VARCHAR NOT NULL,  -- relationship, occasion, format
  taxonomy_value VARCHAR NOT NULL,
  created_at TIMESTAMP
)

-- Product badges
product_badges (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  badge_type VARCHAR NOT NULL,  -- bestseller, valentine, editable, etc.
  badge_text VARCHAR NOT NULL,
  icon VARCHAR,
  created_at TIMESTAMP
)

-- Product content (what's included, why it works, etc.)
product_content (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  section_type VARCHAR NOT NULL,  -- whats_included, why_it_works, how_to_use
  content_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP
)

-- Product FAQs
product_faqs (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP
)

-- Email subscriptions (new table)
email_subscriptions (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  source VARCHAR NOT NULL,  -- homepage, checkout
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
)

-- Collections (static or database-driven)
collections (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  emotional_copy TEXT,
  icon VARCHAR,
  taxonomy_type VARCHAR NOT NULL,
  taxonomy_value VARCHAR NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP
)
```

### Data Validation

```typescript
// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Price formatting
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

// Slug validation
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Collection Page Displays All Matching Products

*For any* collection with a taxonomy filter, the collection page should display all and only products that match the collection's taxonomy criteria.

**Validates: Requirements 2.2, 5.2**

### Property 2: Product Cards Display Required Information

*For any* product displayed in a grid or list, the product card should contain product image, name, price, and all applicable badges.

**Validates: Requirements 2.4, 5.3**

### Property 3: Product Detail Page Completeness

*For any* product, the detail page should display all required sections: image carousel (4-6 images), product info (title, price, max 3 badges, emotional description), what's included section, why it works section (3 statements), how to use section (3 steps), related products (2-3 items), FAQ section (3-5 items), and buy now button.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

### Property 4: Checkout Integration Passes Correct Product Data

*For any* product, when the buy now button is clicked, the checkout overlay should open with the correct product identifier passed to Lemon Squeezy.

**Validates: Requirements 4.1, 4.2**

### Property 5: Variant Selection Availability

*For any* product with variants, the product detail page should display variant selection controls before allowing checkout.

**Validates: Requirements 4.5**

### Property 6: Taxonomy Filtering Accuracy

*For any* set of products and any taxonomy filter (relationship type, occasion, or format), the filtered results should contain only products matching all specified taxonomy criteria.

**Validates: Requirements 5.2**

### Property 7: Mobile Responsive Rendering

*For any* page, when rendered at mobile viewport widths (320px to 768px), all content should be visible and interactive without horizontal scrolling.

**Validates: Requirements 6.4**

### Property 8: SEO Metadata Presence

*For any* page, the rendered HTML should include proper meta tags (title, description, Open Graph data) and, for product pages, structured data markup for product information.

**Validates: Requirements 7.1, 7.2**

### Property 9: URL Pattern Compliance

*For any* collection or product, the URL should follow the clean pattern /collections/{slug} or /products/{slug} where slug contains only lowercase letters, numbers, and hyphens.

**Validates: Requirements 7.3**

### Property 10: Image Alt Text Presence

*For any* image displayed on the storefront, the image element should include non-empty alt text.

**Validates: Requirements 7.4**

### Property 11: Navigation Correctness

*For any* clickable navigation element (collection card, product card, related product, logo), clicking should navigate to the correct destination URL.

**Validates: Requirements 8.1, 8.2, 8.3, 8.5**

### Property 12: Header Consistency

*For any* page in the storefront, the header navigation should be present and contain the same navigation links.

**Validates: Requirements 8.4**

### Property 13: Email Validation

*For any* string input to the email capture form, the validation should correctly identify valid email formats (containing @ and domain) and reject invalid formats.

**Validates: Requirements 10.1**

### Property 14: Valid Email Submission Success

*For any* valid email submitted to the capture form, the system should store the email in the database and display a success confirmation message.

**Validates: Requirements 10.2, 10.3**

### Property 15: Email Submission Error Handling

*For any* email submission that fails (due to database error or duplicate), the form should display an error message and preserve the entered email value in the input field.

**Validates: Requirements 10.4**

## Error Handling

### Client-Side Error Handling

**Product Not Found**:
- When a product slug doesn't exist, display a 404 page with navigation back to collections
- Log the missing slug for monitoring

**Collection Not Found**:
- When a collection slug doesn't exist, display a 404 page with navigation to homepage
- Log the missing slug for monitoring

**Image Loading Failures**:
- Use fallback placeholder images when product images fail to load
- Log image loading errors for monitoring

**Checkout Overlay Failures**:
- If Lemon Squeezy checkout fails to open, display error message with retry button
- Provide alternative contact method (email support)

**Email Submission Failures**:
- Display user-friendly error messages for validation failures
- Display generic error message for server failures
- Preserve user input on error
- Log server errors for monitoring

### Server-Side Error Handling

**Database Query Failures**:
- Catch and log all database errors
- Return appropriate HTTP status codes (500 for server errors)
- Display user-friendly error pages

**API Route Errors**:
- Validate all input data
- Return structured error responses with status codes
- Log errors with context for debugging

**External Service Failures**:
- Handle Lemon Squeezy API failures gracefully
- Implement retry logic for transient failures
- Cache product data to handle temporary outages

### Error Logging

All errors should be logged with:
- Timestamp
- Error type and message
- User context (if available)
- Request details (URL, method)
- Stack trace (for server errors)

## Testing Strategy

### Dual Testing Approach

The storefront will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across many generated inputs.

### Property-Based Testing

**Library**: fast-check (for TypeScript/JavaScript)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with format: **Feature: digital-love-storefront, Property {number}: {property_text}**
- Each correctness property implemented by a single property-based test

**Property Test Coverage**:
- Property 1: Generate random collections and products, verify filtering
- Property 2: Generate random products, verify card displays all fields
- Property 3: Generate random products, verify detail page completeness
- Property 4: Generate random products, verify checkout data passing
- Property 5: Generate products with/without variants, verify variant controls
- Property 6: Generate random products and filters, verify filtering accuracy
- Property 7: Generate random pages, verify mobile rendering
- Property 8: Generate random pages, verify SEO metadata
- Property 9: Generate random slugs, verify URL patterns
- Property 10: Generate random images, verify alt text presence
- Property 11: Generate random navigation elements, verify navigation
- Property 12: Generate random pages, verify header consistency
- Property 13: Generate random email strings, verify validation
- Property 14: Generate random valid emails, verify storage and success
- Property 15: Simulate failures, verify error handling

### Unit Testing

**Framework**: Jest + React Testing Library

**Unit Test Focus**:
- Homepage component rendering (specific sections)
- Collection page with specific products
- Product detail page with specific product data
- Email form validation edge cases (empty, malformed)
- Checkout button click behavior
- Image carousel navigation
- Filter and sort controls
- Error boundary behavior
- 404 page rendering

**Integration Testing**:
- Full page rendering with database queries
- Navigation flows (homepage → collection → product → checkout)
- Email submission end-to-end
- Lemon Squeezy checkout integration

**Test Organization**:
```
__tests__/
├── components/
│   ├── homepage/
│   │   ├── HeroSection.test.tsx
│   │   ├── CollectionCards.test.tsx
│   │   └── EmailCapture.test.tsx
│   ├── collections/
│   │   ├── ProductGrid.test.tsx
│   │   └── FilterSort.test.tsx
│   └── products/
│       ├── ImageCarousel.test.tsx
│       ├── ProductInfo.test.tsx
│       └── BuyNowButton.test.tsx
├── lib/
│   ├── db/
│   │   ├── products.test.ts
│   │   └── email.test.ts
│   └── utils/
│       └── validation.test.ts
├── properties/
│   ├── collection-filtering.property.test.ts
│   ├── product-display.property.test.ts
│   ├── navigation.property.test.ts
│   ├── email-validation.property.test.ts
│   └── seo-metadata.property.test.ts
└── integration/
    ├── homepage.integration.test.tsx
    ├── collection-page.integration.test.tsx
    └── product-page.integration.test.tsx
```

### Test Data Generation

**For Property Tests**:
- Generate random products with varying fields
- Generate random collections with different taxonomies
- Generate random email strings (valid and invalid)
- Generate random slugs and URLs
- Generate random viewport sizes for responsive testing

**For Unit Tests**:
- Use fixture data for specific scenarios
- Mock database queries with predefined responses
- Mock Lemon Squeezy API responses

### Performance Testing

While not covered by property tests, performance should be monitored:
- Lighthouse CI for page load metrics
- Core Web Vitals monitoring (LCP, FID, CLS)
- Image optimization verification
- Bundle size monitoring

### Accessibility Testing

- Automated accessibility testing with jest-axe
- Manual testing with screen readers
- Keyboard navigation testing
- Color contrast verification
