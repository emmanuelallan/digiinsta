# Requirements Document

## Introduction

Migration from Payload CMS to Sanity CMS for DigiInsta, a digital products e-commerce platform. This migration aims to simplify the content management experience, reduce operational complexity, and optimize for SEO while maintaining cost efficiency across all services (Sanity, Vercel, Neon, Cloudflare R2).

## Glossary

- **Sanity**: Headless CMS for content management (products, categories, blog, images)
- **Neon**: Serverless PostgreSQL for transactional data (orders, analytics, sessions)
- **R2**: Cloudflare R2 object storage for large product files (up to 100MB)
- **Polar**: Payment processor (Polar.sh) for checkout and subscriptions
- **Creator**: Third-party product creator who receives 50% revenue share
- **Admin**: Platform administrators (2 users: imma.allan@gmail.com, mburuhildah2@gmail.com)
- **OTP**: One-time password for passwordless authentication
- **Subcategory_Pricing**: Default price set at subcategory level, inherited by products
- **Custom_Price**: Product-specific price that overrides subcategory default
- **Target_Group**: Customer segments (students, professionals, couples)

## Requirements

### Requirement 1: Content Management with Sanity

**User Story:** As an admin, I want to manage all content through Sanity Studio, so that I have a unified and intuitive editing experience.

#### Acceptance Criteria

1. THE Sanity_Studio SHALL provide schema definitions for Category, Subcategory, Product, Bundle, Creator, Post, PostCategory, HeroSlide, TargetGroup, and SiteSettings
2. WHEN an admin creates a product, THE System SHALL auto-generate a URL-friendly slug from the title
3. THE Sanity_Studio SHALL support rich text editing for product descriptions and blog posts
4. WHEN an admin uploads an image, THE Sanity_Studio SHALL store it in Sanity's asset pipeline with CDN delivery
5. THE System SHALL use Sanity's image transformation API for responsive images (thumbnails, cards, features)

### Requirement 2: Category and Subcategory Structure

**User Story:** As an admin, I want to organize products into categories and subcategories, so that customers can easily browse and find products.

#### Acceptance Criteria

1. THE Category_Schema SHALL include title, slug, description, image, icon, gradient, displayOrder, and status fields
2. THE Subcategory_Schema SHALL include title, slug, description, category reference, defaultPrice, compareAtPrice, and status fields
3. WHEN a subcategory has a defaultPrice, THE System SHALL apply this price to all products in that subcategory unless overridden
4. THE System SHALL generate SEO-friendly URLs in format: /category/[category-slug]/[subcategory-slug]
5. WHEN displaying categories, THE System SHALL order them by displayOrder field ascending

### Requirement 3: Product Management

**User Story:** As an admin, I want to create and manage digital products with flexible pricing, so that I can sell various digital goods.

#### Acceptance Criteria

1. THE Product_Schema SHALL include title, slug, description, shortDescription, subcategory reference, creator reference, polarProductId, customPrice, compareAtPrice, images array, productFile (R2 reference), status, tags, and targetGroups fields
2. WHEN a product has no customPrice, THE System SHALL use the subcategory's defaultPrice
3. WHEN a product has a customPrice, THE System SHALL use the customPrice instead of subcategory default
4. THE System SHALL store product download files in Cloudflare R2 with presigned URL access
5. THE System SHALL generate SEO-friendly URLs in format: /product/[product-slug]
6. WHEN a product is created, THE System SHALL record the createdAt timestamp for new arrivals sorting

### Requirement 4: Creator Management and Revenue Tracking

**User Story:** As an admin, I want to track third-party creators and their revenue share, so that I can manage partnerships and payouts.

#### Acceptance Criteria

1. THE Creator_Schema SHALL include name, email, slug, bio, and status fields
2. WHEN an order is completed for a creator's product, THE System SHALL record the creator attribution in the order
3. THE System SHALL calculate 50% revenue share for creators automatically
4. WHEN a creator requests a report, THE System SHALL generate an expiring link showing their product performance and earnings
5. THE Analytics_System SHALL track sales count, revenue, and conversion rates per creator

### Requirement 5: Bundle Management

**User Story:** As an admin, I want to create product bundles with discounts, so that I can offer value packages to customers.

#### Acceptance Criteria

1. THE Bundle_Schema SHALL include title, slug, description, products array, polarProductId, price, compareAtPrice, heroImage, and status fields
2. WHEN displaying a bundle, THE System SHALL calculate and show savings amount and percentage
3. THE System SHALL generate SEO-friendly URLs in format: /bundle/[bundle-slug]
4. WHEN a bundle is purchased, THE System SHALL attribute revenue to each product's creator proportionally

### Requirement 6: Order and Analytics Management

**User Story:** As an admin, I want to track orders and analytics, so that I can understand business performance.

#### Acceptance Criteria

1. WHEN Polar sends an order webhook, THE System SHALL create an order record in Neon PostgreSQL
2. THE Order_Record SHALL include polarOrderId, email, items, totalAmount, currency, creatorId, and timestamps
3. THE System SHALL track download counts per order item with configurable limits
4. THE Analytics_System SHALL calculate best sellers based on order_items count
5. THE System SHALL identify new arrivals as products created within the last 30 days without manual marking
6. WHEN a product has compareAtPrice higher than current price, THE System SHALL mark it as on sale

### Requirement 7: Blog System

**User Story:** As an admin, I want to publish blog posts with categories, so that I can drive organic traffic and engage customers.

#### Acceptance Criteria

1. THE Post_Schema SHALL include title, slug, content (rich text), excerpt, coverImage, category reference, author, publishedAt, and status fields
2. THE PostCategory_Schema SHALL include title, slug, description, and displayOrder fields
3. THE System SHALL generate SEO-friendly URLs in format: /blog/[post-slug]
4. WHEN displaying blog posts, THE System SHALL support filtering by category
5. THE System SHALL generate proper meta tags, Open Graph, and JSON-LD for blog posts

### Requirement 8: Admin Authentication

**User Story:** As an admin, I want to login with email OTP only, so that I have a simple and secure authentication experience.

#### Acceptance Criteria

1. THE System SHALL only allow login for seeded admin emails: imma.allan@gmail.com and mburuhildah2@gmail.com
2. WHEN an admin enters their email, THE System SHALL send a one-time password via email
3. WHEN a valid OTP is entered, THE System SHALL create a session
4. THE System SHALL NOT require passwords, only email-based OTP
5. IF an unauthorized email attempts login, THEN THE System SHALL reject the request

### Requirement 9: SEO Optimization

**User Story:** As an admin, I want the platform optimized for SEO, so that products rank well in search engines.

#### Acceptance Criteria

1. THE System SHALL generate semantic URLs for all content types (categories, products, bundles, blog)
2. THE System SHALL auto-generate meta titles and descriptions from content fields
3. THE System SHALL include JSON-LD structured data for products (Product schema), blog posts (Article schema), and organization
4. THE System SHALL generate a dynamic sitemap from Sanity content
5. THE System SHALL implement proper canonical URLs and Open Graph tags
6. THE System SHALL use semantic HTML structure with proper heading hierarchy

### Requirement 10: Target Group Segmentation

**User Story:** As an admin, I want to tag products for target groups, so that customers can shop by persona.

#### Acceptance Criteria

1. THE TargetGroup_Schema SHALL include title, slug, description, tagline, icon, image, gradient, and relatedCategories fields
2. THE Product_Schema SHALL support multiple targetGroup references
3. THE System SHALL provide "Shop by Persona" navigation for students, professionals, and couples
4. WHEN displaying a target group page, THE System SHALL show all products tagged with that group

### Requirement 11: Recommendations and Discovery

**User Story:** As a customer, I want to discover related products, so that I can find complementary items.

#### Acceptance Criteria

1. THE System SHALL display "Frequently Bought Together" based on order history analysis
2. THE System SHALL display "Related Products" based on same subcategory or tags
3. THE System SHALL display "New Arrivals" sorted by createdAt descending (last 30 days)
4. THE System SHALL display "Best Sellers" sorted by sales count from analytics
5. THE System SHALL display "On Sale" products where compareAtPrice > currentPrice

### Requirement 12: File Storage and Downloads

**User Story:** As a customer, I want to securely download purchased products, so that I can access my digital goods.

#### Acceptance Criteria

1. THE System SHALL store product files in Cloudflare R2 bucket
2. WHEN a customer requests a download, THE System SHALL generate a presigned URL valid for 1 hour
3. THE System SHALL track download count per order item
4. WHEN download limit is reached, THE System SHALL prevent further downloads
5. THE System SHALL support files up to 100MB

### Requirement 13: Performance and Cost Optimization

**User Story:** As a platform owner, I want to minimize costs while maintaining performance, so that the business remains profitable.

#### Acceptance Criteria

1. THE System SHALL use Sanity CDN for image delivery with automatic optimization
2. THE System SHALL implement ISR (Incremental Static Regeneration) for product and category pages
3. THE System SHALL cache Sanity queries with appropriate revalidation times
4. THE System SHALL use edge caching for static assets
5. THE System SHALL stay within free tier limits: Sanity (100K API requests/month), Vercel (100GB bandwidth), Neon (0.5GB storage), R2 (10GB storage)

### Requirement 14: Hero Slides Management

**User Story:** As an admin, I want to manage homepage hero carousel, so that I can promote featured content.

#### Acceptance Criteria

1. THE HeroSlide_Schema SHALL include title, headline, subheadline, image, mobileImage, primaryCta, secondaryCta, textPosition, textColor, overlayOpacity, displayOrder, and status fields
2. WHEN displaying hero slides, THE System SHALL order them by displayOrder ascending
3. THE System SHALL only display slides with status "active"

### Requirement 15: Site Settings

**User Story:** As an admin, I want to manage global site settings, so that I can control SEO defaults and social links.

#### Acceptance Criteria

1. THE SiteSettings_Schema SHALL include siteName, siteDescription, defaultMetaImage, socialLinks, contactEmail, and footerText fields
2. THE System SHALL use SiteSettings for default meta tags when page-specific ones are not set
3. THE SiteSettings SHALL be a singleton document (only one instance)
