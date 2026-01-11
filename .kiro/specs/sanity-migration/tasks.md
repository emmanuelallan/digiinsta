# Implementation Plan: Sanity Migration

## Overview

This implementation plan migrates DigiInsta from Payload CMS to Sanity CMS while maintaining Neon PostgreSQL for transactional data and Cloudflare R2 for file storage. Tasks are ordered to build incrementally with early validation.

## Tasks

- [x] 1. Project Setup and Cleanup
  - [x] 1.1 Remove Payload CMS dependencies and configuration
    - Remove @payloadcms/\* packages from package.json
    - Delete payload.config.ts
    - Delete collections/ directory
    - Delete app/(payload)/ directory
    - Delete payload-types.ts
    - Delete migrations/ directory
    - _Requirements: 1.1_

  - [x] 1.2 Install Sanity dependencies and configure client
    - Add @sanity/client, @sanity/image-url, next-sanity to package.json
    - Create lib/sanity/client.ts with read and write clients
    - Create lib/sanity/image.ts with urlFor helper
    - Add SANITY environment variables to .env.local
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 1.3 Set up embedded Sanity Studio
    - Create app/(studio)/studio/[[...tool]]/page.tsx
    - Create sanity.config.ts in project root
    - Create sanity.cli.ts in project root
    - Configure studio route in next.config.ts
    - _Requirements: 1.1_

  - [x] 1.4 Configure Neon database schema
    - Create lib/db/schema.sql with orders, order_items, analytics_events, admin_sessions, creator_report_tokens tables
    - Create lib/db/client.ts with neon client
    - Create lib/db/migrate.ts script to run migrations
    - _Requirements: 6.1, 6.2_

- [x] 2. Sanity Schema Implementation
  - [x] 2.1 Create Category and Subcategory schemas
    - Create sanity/schemas/category.ts with all fields
    - Create sanity/schemas/subcategory.ts with defaultPrice field
    - Add SEO fields (metaTitle, metaDescription) to both
    - _Requirements: 2.1, 2.2, 9.1_

  - [x] 2.2 Create Product schema
    - Create sanity/schemas/product.ts with all fields
    - Include customPrice for price override
    - Include productFileKey for R2 reference
    - Include targetGroups array reference
    - Add SEO fields
    - _Requirements: 3.1, 10.2_

  - [x] 2.3 Create Creator schema
    - Create sanity/schemas/creator.ts with name, email, slug, bio, status
    - _Requirements: 4.1_

  - [x] 2.4 Create Bundle schema
    - Create sanity/schemas/bundle.ts with products array
    - Include price and compareAtPrice for savings calculation
    - Add SEO fields
    - _Requirements: 5.1_

  - [x] 2.5 Create Blog schemas (Post and PostCategory)
    - Create sanity/schemas/post.ts with rich text content
    - Create sanity/schemas/postCategory.ts
    - Add SEO fields
    - _Requirements: 7.1, 7.2_

  - [x] 2.6 Create supporting schemas (TargetGroup, HeroSlide, SiteSettings)
    - Create sanity/schemas/targetGroup.ts
    - Create sanity/schemas/heroSlide.ts with displayOrder
    - Create sanity/schemas/siteSettings.ts as singleton
    - _Requirements: 10.1, 14.1, 15.1_

  - [x] 2.7 Create shared schema types (blockContent, seo)
    - Create sanity/schemas/blockContent.ts for rich text
    - Create sanity/schemas/objects/seo.ts for reusable SEO fields
    - Export all schemas in sanity/schemas/index.ts
    - _Requirements: 1.3_

- [x] 3. Core Business Logic Implementation
  - [x] 3.1 Implement slug generation utility
    - Create lib/utils/slug.ts with generateSlug function
    - Handle special characters, spaces, consecutive hyphens
    - _Requirements: 1.2_

  - [x] 3.2 Write property test for slug generation
    - **Property 1: Slug Generation Produces Valid URLs**
    - Test with fast-check for arbitrary strings
    - **Validates: Requirements 1.2, 3.5, 5.3, 7.3**

  - [x] 3.3 Implement price resolution service
    - Create lib/pricing/resolver.ts with resolveProductPrice function
    - Handle customPrice override logic
    - Calculate isOnSale, savings, savingsPercentage
    - _Requirements: 2.3, 3.2, 3.3_

  - [x] 3.4 Write property test for price resolution
    - **Property 2: Price Inheritance Resolution**
    - **Property 3: Sale Detection Accuracy**
    - Test with various price combinations
    - **Validates: Requirements 2.3, 3.2, 3.3, 5.2, 6.6**

  - [x] 3.5 Implement creator revenue calculation
    - Create lib/revenue/calculator.ts with calculateCreatorRevenue function
    - Handle 50% split for products
    - Handle proportional split for bundles
    - _Requirements: 4.3, 5.4_

  - [x] 3.6 Write property test for revenue calculation
    - **Property 4: Creator Revenue Calculation**
    - Test with various order configurations
    - **Validates: Requirements 4.3, 5.4**

  - [x] 3.7 Implement download tracking service
    - Create lib/downloads/tracker.ts with trackDownload, canDownload functions
    - Integrate with Neon order_items table
    - _Requirements: 6.3, 12.3, 12.4_

  - [x] 3.8 Write property test for download limits
    - **Property 5: Download Limit Enforcement**
    - Test increment and blocking behavior
    - **Validates: Requirements 6.3, 12.3, 12.4**

- [x] 4. Checkpoint - Core Logic Tests Pass
  - Ensure all property tests pass
  - Run: bun run typecheck && bun run lint && bun run test
  - Ask the user if questions arise

- [x] 5. Sanity Query Layer Implementation
  - [x] 5.1 Create GROQ queries for categories and subcategories
    - Create lib/sanity/queries/categories.ts
    - Include sorting by displayOrder
    - Include product counts
    - _Requirements: 2.4, 2.5_

  - [x] 5.2 Create GROQ queries for products
    - Create lib/sanity/queries/products.ts
    - Include subcategory expansion for price resolution
    - Include creator reference expansion
    - Support filtering by status, subcategory, tags, targetGroups
    - _Requirements: 3.5, 10.4_

  - [x] 5.3 Create GROQ queries for bundles
    - Create lib/sanity/queries/bundles.ts
    - Include products array expansion
    - _Requirements: 5.3_

  - [x] 5.4 Create GROQ queries for blog posts
    - Create lib/sanity/queries/posts.ts
    - Include category filtering
    - Support pagination
    - _Requirements: 7.3, 7.4_

  - [x] 5.5 Create GROQ queries for discovery features
    - Create lib/sanity/queries/discovery.ts
    - New arrivals (last 30 days by \_createdAt)
    - Related products (same subcategory or tags)
    - _Requirements: 6.5, 11.2, 11.3_

  - [x] 5.6 Write property test for new arrivals filtering
    - **Property 6: New Arrivals Date Filtering**
    - Test date boundary conditions
    - **Validates: Requirements 6.5, 11.3**

  - [x] 5.7 Write property test for related products
    - **Property 10: Related Products Relevance**
    - Test subcategory and tag matching
    - **Validates: Requirements 11.2**

- [x] 6. Analytics and Best Sellers Implementation
  - [x] 6.1 Create analytics event tracking
    - Create lib/analytics/tracker.ts with trackEvent function
    - Support view, add_to_cart, purchase events
    - Store in Neon analytics_events table
    - _Requirements: 4.5_

  - [x] 6.2 Create best sellers query
    - Create lib/analytics/bestsellers.ts
    - Query order_items grouped by sanity_id
    - Return sorted by count descending
    - _Requirements: 6.4, 11.4_

  - [x] 6.3 Create frequently bought together query
    - Create lib/analytics/fbt.ts
    - Analyze co-occurrence in orders
    - Return top co-purchased products
    - _Requirements: 11.1_

  - [x] 6.4 Write property test for sorting consistency
    - **Property 9: Sorting Consistency**
    - Test various sorting scenarios
    - **Validates: Requirements 2.5, 11.3, 11.4, 14.2**

- [x] 7. Admin Authentication Implementation
  - [x] 7.1 Create OTP generation and validation
    - Create lib/auth/otp.ts with generateOTP, hashOTP, verifyOTP functions
    - Use crypto for secure random generation
    - Set 10-minute expiration
    - _Requirements: 8.2, 8.3_

  - [x] 7.2 Create admin session management
    - Create lib/auth/session.ts with createSession, validateSession, destroySession
    - Store in Neon admin_sessions table
    - Set 7-day session expiration
    - _Requirements: 8.3_

  - [x] 7.3 Create admin authorization check
    - Create lib/auth/admin.ts with isAuthorizedAdmin function
    - Hardcode allowed emails: imma.allan@gmail.com, mburuhildah2@gmail.com
    - _Requirements: 8.1, 8.5_

  - [x] 7.4 Write property test for admin authentication
    - **Property 7: Admin Authentication Authorization**
    - Test authorized and unauthorized emails
    - **Validates: Requirements 8.1, 8.3, 8.5**

  - [x] 7.5 Create auth API routes
    - Create app/api/auth/login/route.ts (send OTP)
    - Create app/api/auth/verify/route.ts (verify OTP, create session)
    - Create app/api/auth/logout/route.ts (destroy session)
    - Integrate with Resend for email delivery
    - _Requirements: 8.2, 8.3_

- [x] 8. Checkpoint - Auth and Analytics Tests Pass
  - Ensure all tests pass
  - Run: bun run typecheck && bun run lint && bun run test
  - Ask the user if questions arise

- [x] 9. File Storage Implementation
  - [x] 9.1 Create R2 upload service
    - Create lib/storage/upload.ts with generateUploadUrl function
    - Support files up to 100MB
    - Return presigned PUT URL
    - _Requirements: 3.4, 12.1_

  - [x] 9.2 Create R2 download service
    - Create lib/storage/download.ts with generateDownloadUrl function
    - Set 1-hour expiration
    - _Requirements: 12.2_

  - [x] 9.3 Write property test for presigned URL expiration
    - **Property 11: Presigned URL Expiration**
    - Test expiration time calculation
    - **Validates: Requirements 12.2**

  - [x] 9.4 Create file upload API route
    - Create app/api/upload/route.ts
    - Require admin authentication
    - Return presigned URL and file key
    - _Requirements: 3.4_

  - [x] 9.5 Create download API route
    - Create app/api/download/[orderId]/[itemId]/route.ts
    - Verify order ownership
    - Check download limits
    - Return presigned URL or error
    - _Requirements: 12.2, 12.4_

- [x] 10. Creator Reports Implementation
  - [x] 10.1 Create creator report token generation
    - Create lib/creators/reports.ts with generateReportToken function
    - Set configurable expiration (default 7 days)
    - Store in Neon creator_report_tokens table
    - _Requirements: 4.4_

  - [x] 10.2 Write property test for report token expiration
    - **Property 12: Creator Report Token Expiration**
    - Test token validation and expiration
    - **Validates: Requirements 4.4**

  - [x] 10.3 Create creator report API route
    - Create app/api/creators/report/[token]/route.ts
    - Validate token and expiration
    - Return sales data, revenue, and performance metrics
    - _Requirements: 4.4, 4.5_

- [x] 11. SEO Implementation
  - [x] 11.1 Create meta generation utilities
    - Create lib/seo/meta.ts with generateMeta function
    - Handle fallbacks to SiteSettings
    - Generate Open Graph tags
    - _Requirements: 9.2, 9.5, 15.2_

  - [x] 11.2 Create JSON-LD generators
    - Create lib/seo/jsonld.ts with generators for Product, Article, Organization
    - Follow schema.org specifications
    - _Requirements: 9.3_

  - [x] 11.3 Write property test for SEO meta generation
    - **Property 8: SEO Meta Generation**
    - Test fallback behavior and required fields
    - **Validates: Requirements 7.5, 9.2, 9.3, 9.5, 15.2**

  - [x] 11.4 Create dynamic sitemap
    - Update app/sitemap.ts to query Sanity
    - Include all products, categories, bundles, posts
    - _Requirements: 9.4_

  - [x] 11.5 Update robots.ts
    - Ensure proper crawling rules
    - Reference sitemap
    - _Requirements: 9.1_

- [x] 12. Polar Webhook Integration
  - [x] 12.1 Create webhook handler
    - Create app/api/webhooks/polar/route.ts
    - Verify webhook signature
    - Handle order.created event
    - _Requirements: 6.1_

  - [x] 12.2 Create order processing service
    - Create lib/orders/processor.ts
    - Create order record in Neon
    - Create order_items with creator attribution
    - Track analytics event
    - _Requirements: 6.1, 6.2, 4.2_

- [x] 13. Checkpoint - All Backend Tests Pass
  - Ensure all property tests pass
  - Run: bun run typecheck && bun run lint && bun run test
  - Ask the user if questions arise

- [x] 14. Frontend Type Definitions
  - [x] 14.1 Create Sanity type definitions
    - Create types/sanity.ts with interfaces for all document types
    - Use Sanity's type generation or manual definitions
    - _Requirements: 1.1_

  - [x] 14.2 Update storefront types
    - Update types/storefront.ts to use Sanity types
    - Add resolved price types
    - Add discovery types (NewArrivals, BestSellers, etc.)
    - _Requirements: 3.1, 6.5, 11.1-11.5_

- [x] 15. Frontend Data Fetching Layer
  - [x] 15.1 Create category data fetchers
    - Create lib/storefront/categories.ts
    - Implement getCategories, getCategoryBySlug, getSubcategoryBySlug
    - Include ISR revalidation
    - _Requirements: 2.4, 2.5_

  - [x] 15.2 Create product data fetchers
    - Create lib/storefront/products.ts
    - Implement getProducts, getProductBySlug, getProductsBySubcategory
    - Include price resolution
    - _Requirements: 3.5_

  - [x] 15.3 Create bundle data fetchers
    - Create lib/storefront/bundles.ts
    - Implement getBundles, getBundleBySlug
    - Include savings calculation
    - _Requirements: 5.2, 5.3_

  - [x] 15.4 Create blog data fetchers
    - Create lib/storefront/blog.ts
    - Implement getPosts, getPostBySlug, getPostsByCategory
    - _Requirements: 7.3, 7.4_

  - [x] 15.5 Create discovery data fetchers
    - Create lib/storefront/discovery.ts
    - Implement getNewArrivals, getBestSellers, getOnSale, getRelatedProducts, getFrequentlyBoughtTogether
    - _Requirements: 6.5, 11.1-11.5_

- [-] 16. Frontend Page Updates
  - [x] 16.1 Update category pages
    - Update app/(frontend)/category/[slug]/page.tsx
    - Update app/(frontend)/category/[slug]/[subcategory]/page.tsx
    - Use Sanity data fetchers
    - Add JSON-LD and meta tags
    - _Requirements: 2.4, 9.1, 9.2, 9.3_

  - [x] 16.2 Update product pages
    - Update app/(frontend)/product/[slug]/page.tsx
    - Use Sanity data fetchers with price resolution
    - Add related products and FBT sections
    - Add JSON-LD Product schema
    - _Requirements: 3.5, 9.3, 11.1, 11.2_

  - [x] 16.3 Update bundle pages
    - Update app/(frontend)/bundle/[slug]/page.tsx
    - Show savings and included products
    - Add JSON-LD
    - _Requirements: 5.2, 5.3_

  - [x] 16.4 Update blog pages
    - Update app/(frontend)/blog/page.tsx
    - Update app/(frontend)/blog/[slug]/page.tsx
    - Add category filtering
    - Add JSON-LD Article schema
    - _Requirements: 7.3, 7.4, 9.3_

  - [x] 16.5 Update homepage
    - Update app/(frontend)/page.tsx
    - Add hero slides from Sanity
    - Add new arrivals, best sellers, on sale sections
    - _Requirements: 14.2, 14.3, 6.5, 11.3, 11.4, 11.5_

  - [x] 16.6 Create target group pages
    - Create app/(frontend)/shop/[persona]/page.tsx
    - Filter products by targetGroup
    - _Requirements: 10.3, 10.4_

- [x] 17. Admin UI Updates
  - [x] 17.1 Create admin login page
    - Create app/(app)/login/page.tsx
    - Email input with OTP flow
    - _Requirements: 8.1, 8.2_

  - [x] 17.2 Create admin dashboard
    - Update app/(app)/dashboard/page.tsx
    - Show sales metrics from Neon
    - Show recent orders
    - _Requirements: 6.4_

  - [x] 17.3 Create file upload component
    - Create components/admin/FileUpload.tsx
    - Use presigned URL upload to R2
    - Show progress and completion
    - _Requirements: 3.4, 12.1_

  - [x] 17.4 Create creator report generation UI
    - Create app/(app)/creators/page.tsx
    - List creators with report link generation
    - _Requirements: 4.4_

- [x] 18. Final Cleanup and Optimization
  - [x] 18.1 Remove unused Payload components
    - Delete components/admin/Dashboard/ (Payload-specific)
    - Delete components/admin/Upload/ (Payload-specific)
    - Delete components/admin/Revalidation/ (Payload-specific)
    - Clean up unused imports
    - _Requirements: 1.1_

  - [x] 18.2 Update environment variables
    - Remove PAYLOAD\_\* variables
    - Add SANITY\_\* variables
    - Update .env.example
    - _Requirements: 1.1_

  - [x] 18.3 Configure caching and ISR
    - Set appropriate revalidate times for pages
    - Configure Sanity CDN usage
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 18.4 Update package.json scripts
    - Add sanity script for studio dev
    - Ensure bun run typecheck, lint, test, build all pass
    - _Requirements: 13.5_

- [x] 19. Final Checkpoint - Full Build Passes
  - Run: bun run typecheck && bun run lint && bun run test && bun run build
  - Verify all pages render correctly
  - Test checkout flow with Polar
  - Test file download flow
  - Ask the user if questions arise

## Notes

- All tasks including property-based tests are required for comprehensive correctness
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All commands use `bun` as the package manager
- Pre-commit hook should run: `bun run typecheck && bun run lint && bun run test && bun run build`
