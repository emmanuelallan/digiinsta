# Implementation Plan: Comprehensive Site Optimization

## Overview

This implementation plan breaks down the comprehensive site optimization into discrete, incremental coding tasks. Tasks are organized by priority (Critical → High → Medium → Low) to deliver maximum impact early. Each task builds on previous work, ensuring no orphaned code.

## Tasks

### Phase 1: Performance Foundation (Critical)

- [x] 1. Implement Static Generation with ISR
  - [x] 1.1 Add `generateStaticParams` to product pages
    - Update `app/(frontend)/products/[slug]/page.tsx`
    - Fetch all active product slugs from Payload CMS
    - Export `revalidate = 3600` constant
    - _Requirements: 1.1, 1.4_
  - [x] 1.2 Add `generateStaticParams` to category and subcategory pages
    - Update `app/(frontend)/categories/[slug]/page.tsx`
    - Update `app/(frontend)/subcategories/[slug]/page.tsx`
    - Export `revalidate = 86400` constant
    - _Requirements: 1.2, 1.5_
  - [x] 1.3 Add `generateStaticParams` to bundle pages
    - Update `app/(frontend)/bundles/[slug]/page.tsx`
    - Export `revalidate = 3600` constant
    - _Requirements: 1.3, 1.4_
  - [x] 1.4 Write property test for static params generation
    - **Property 1: Static params generation returns valid slugs**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - [x] 1.5 Implement on-demand revalidation webhook
    - Create `app/api/webhooks/revalidate/route.ts`
    - Handle Payload CMS afterChange hooks
    - Call `revalidatePath()` for updated content
    - _Requirements: 1.6_

- [x] 2. Optimize Image Loading Strategy
  - [x] 2.1 Create OptimizedImage component
    - Create `components/storefront/shared/OptimizedImage.tsx`
    - Implement priority prop for above-fold images
    - Add responsive sizes configuration
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Implement blur placeholder generation
    - Create `lib/image/blur-placeholder.ts`
    - Generate base64 blur data URLs for product images
    - Integrate with OptimizedImage component
    - _Requirements: 2.4_
  - [x] 2.3 Write property test for blur data URL generation
    - **Property 2: Blur data URL generation produces valid base64**
    - **Validates: Requirements 2.4**
  - [x] 2.4 Update ProductImageGallery to use OptimizedImage
    - Refactor `components/storefront/product/ProductImageGallery.tsx`
    - Add priority to first image, lazy load rest
    - _Requirements: 2.1, 2.2_

- [x] 3. Checkpoint - Verify Performance Foundation
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Conversion Optimization (Critical)

- [x] 4. Implement Quick-Add to Cart
  - [x] 4.1 Create QuickAddButton component
    - Create `components/storefront/product/QuickAddButton.tsx`
    - Implement overlay variant for product cards
    - Add optimistic update support
    - _Requirements: 10.1, 10.2, 10.5_
  - [x] 4.2 Update ProductCard with quick-add overlay
    - Modify `components/storefront/product/ProductCard.tsx`
    - Add hover state with QuickAddButton
    - _Requirements: 10.1_
  - [x] 4.3 Implement cart toast notification
    - Create `components/storefront/cart/CartToast.tsx`
    - Show on successful add with "View Cart" link
    - Add cart icon animation
    - _Requirements: 10.3, 10.4_
  - [x] 4.4 Write property test for cart operations
    - **Property 12: Cart operations preserve data integrity**
    - **Validates: Requirements 10.2, 10.5**

- [x] 5. Implement Sticky Add-to-Cart Bar
  - [x] 5.1 Create StickyAddToCart component
    - Create `components/storefront/product/StickyAddToCart.tsx`
    - Implement intersection observer for visibility
    - Add smooth animation on show/hide
    - _Requirements: 11.1, 11.2, 11.5_
  - [x] 5.2 Create useElementVisibility hook
    - Create `lib/hooks/use-element-visibility.ts`
    - Use IntersectionObserver API
    - _Requirements: 11.1, 11.4_
  - [x] 5.3 Integrate sticky bar into product page
    - Update `app/(frontend)/products/[slug]/page.tsx`
    - Add trigger ref to main CTA section
    - _Requirements: 11.1_

- [x] 6. Implement Trust Signals
  - [x] 6.1 Create TrustSignals component
    - Create `components/storefront/shared/TrustSignals.tsx`
    - Add secure checkout, instant download, guarantee badges
    - Support product, checkout, footer variants
    - _Requirements: 12.2, 12.3_
  - [x] 6.2 Add trust signals to product page and checkout
    - Update product page layout
    - Update checkout page layout
    - _Requirements: 12.2_

- [x] 7. Implement Urgency Elements
  - [x] 7.1 Create SaleCountdown component
    - Create `components/storefront/product/SaleCountdown.tsx`
    - Implement countdown timer logic
    - Support badge, banner, inline variants
    - _Requirements: 13.1_
  - [x] 7.2 Write property test for countdown calculation
    - **Property 13: Sale countdown calculates correctly**
    - **Validates: Requirements 13.1**
  - [x] 7.3 Create ProductBadges component
    - Create `components/storefront/product/ProductBadges.tsx`
    - Implement New, Sale, Popular badge logic
    - _Requirements: 13.2, 13.3, 13.4_
  - [x] 7.4 Write property test for badge determination
    - **Property 14: Product badges are correctly determined**
    - **Validates: Requirements 13.2, 13.3, 13.4**
  - [x] 7.5 Integrate badges into ProductCard
    - Update ProductCard to use ProductBadges
    - _Requirements: 13.2, 13.3, 13.4_

- [x] 8. Checkpoint - Verify Conversion Features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: SEO Enhancement (High)

- [x] 9. Implement Enhanced Structured Data
  - [x] 9.1 Create enhanced schema generators
    - Update `lib/seo.ts` with new schema functions
    - Add `getEnhancedProductSchema` with AggregateRating support
    - Add `getArticleSchema` for blog posts
    - _Requirements: 6.1, 6.2, 8.1, 8.2_
  - [x] 9.2 Write property test for product schema with reviews
    - **Property 3: Product schema includes valid review data when available**
    - **Validates: Requirements 6.1, 6.2**
  - [x] 9.3 Add Offer schema with priceValidUntil
    - Extend product schema for sale items
    - Include sale end date when available
    - _Requirements: 6.3_
  - [x] 9.4 Write property test for sale item schema
    - **Property 4: Sale items include priceValidUntil in Offer schema**
    - **Validates: Requirements 6.3**
  - [x] 9.5 Create ProductGroup schema for bundles
    - Add `getProductGroupSchema` function
    - Include all bundle products as isRelatedTo
    - _Requirements: 6.4_
  - [x] 9.6 Write property test for bundle schema
    - **Property 5: Bundle schema includes all product references**
    - **Validates: Requirements 6.4**
  - [x] 9.7 Write property test for blog post schema
    - **Property 6: Blog post schema contains required article fields**
    - **Validates: Requirements 8.1, 8.2**

- [x] 10. Implement Internal Linking Strategy
  - [x] 10.1 Create recommendations service
    - Create `lib/storefront/recommendations.ts`
    - Implement `getFrequentlyBoughtTogether`
    - Implement `getCustomersAlsoViewed`
    - _Requirements: 7.1, 7.2_
  - [x] 10.2 Write property test for related products
    - **Property 22: Related products exclude the source product**
    - **Property 23: Related products are from same or related categories**
    - **Validates: Requirements 7.1, 7.2**
  - [x] 10.3 Create FrequentlyBoughtTogether component
    - Create `components/storefront/product/FrequentlyBoughtTogether.tsx`
    - Display related products with add-all-to-cart option
    - _Requirements: 7.1_
  - [x] 10.4 Create RelatedCategories component
    - Create `components/storefront/shared/RelatedCategories.tsx`
    - Display sibling and parent categories
    - _Requirements: 7.4_
  - [x] 10.5 Integrate internal linking into pages
    - Add FrequentlyBoughtTogether to product pages
    - Add RelatedCategories to category pages
    - _Requirements: 7.1, 7.4_

- [-] 11. Implement Blog SEO Optimization
  - [x] 11.1 Create reading time calculator
    - Create `lib/blog/reading-time.ts`
    - Calculate based on word count (200 wpm)
    - _Requirements: 8.3_
  - [x] 11.2 Write property test for reading time
    - **Property 7: Reading time calculation is consistent**
    - **Validates: Requirements 8.3**
  - [x] 11.3 Create TableOfContents component
    - Create `components/storefront/blog/TableOfContents.tsx`
    - Extract headings from rich text content
    - _Requirements: 8.4_
  - [x] 11.4 Write property test for TOC extraction
    - **Property 8: Table of contents extraction is complete**
    - **Validates: Requirements 8.4**
  - [x] 11.5 Create RelatedPosts component
    - Create `components/storefront/blog/RelatedPosts.tsx`
    - Display posts from same category/tags
    - _Requirements: 8.5_
  - [x] 11.6 Update blog post page with SEO features
    - Add reading time display
    - Add table of contents for long posts
    - Add related posts section
    - Add author bio with schema
    - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [x] 12. Checkpoint - Verify SEO Features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: UX Improvements (High)

- [-] 13. Implement Advanced Search
  - [x] 13.1 Create enhanced search service
    - Update `lib/storefront/search.ts`
    - Add filter support (category, price, tags)
    - Add sort options
    - _Requirements: 15.2, 15.3_
  - [x] 13.2 Write property test for search filtering
    - **Property 16: Search with filters returns correctly filtered results**
    - **Validates: Requirements 15.1, 15.2, 15.3**
  - [x] 13.3 Create search suggestions service
    - Create `lib/storefront/search-suggestions.ts`
    - Return matching products, categories, recent queries
    - _Requirements: 15.1_
  - [x] 13.4 Write property test for search suggestions
    - **Property 17: Search suggestions are relevant**
    - **Validates: Requirements 15.1**
  - [x] 13.5 Create AdvancedSearch component
    - Create `components/storefront/search/AdvancedSearch.tsx`
    - Add autocomplete dropdown
    - Add filter sidebar
    - Add sort dropdown
    - _Requirements: 15.1, 15.2, 15.3_
  - [x] 13.6 Implement search tracking
    - Track queries and results count
    - _Requirements: 15.6_
  - [x] 13.7 Write property test for search tracking
    - **Property 21: Search queries are tracked with results count**
    - **Validates: Requirements 15.6**
  - [x] 13.8 Create NoResults component
    - Create `components/storefront/search/NoResults.tsx`
    - Show suggestions and popular products
    - _Requirements: 15.5_

- [ ] 14. Implement Quick View Modal
  - [ ] 14.1 Create QuickViewModal component
    - Create `components/storefront/product/QuickViewModal.tsx`
    - Display product images, title, price, description
    - Add Add to Cart and View Full Details buttons
    - _Requirements: 16.1, 16.2, 16.3_
  - [ ] 14.2 Create useQuickViewData hook
    - Create `lib/hooks/use-quick-view-data.ts`
    - Lazy load product data on modal open
    - _Requirements: 16.5_
  - [ ] 14.3 Add keyboard accessibility
    - Close on Escape key
    - Trap focus within modal
    - _Requirements: 16.4_
  - [ ] 14.4 Integrate quick view into ProductCard
    - Add Quick View button to product cards
    - _Requirements: 16.1_

- [ ] 15. Implement Wishlist System
  - [ ] 15.1 Create wishlist context and provider
    - Create `lib/wishlist/wishlist-context.tsx`
    - Implement localStorage persistence
    - Add add, remove, move-to-cart functions
    - _Requirements: 17.1, 17.2, 17.5_
  - [ ] 15.2 Write property test for wishlist operations
    - **Property 18: Wishlist round-trip preserves data**
    - **Property 19: Wishlist to cart transfer is complete**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.5**
  - [ ] 15.3 Create WishlistButton component
    - Create `components/storefront/wishlist/WishlistButton.tsx`
    - Support icon and button variants
    - _Requirements: 17.1_
  - [ ] 15.4 Create wishlist page
    - Create `app/(frontend)/wishlist/page.tsx`
    - Display all wishlist items
    - Add move-to-cart and remove actions
    - _Requirements: 17.4_
  - [ ] 15.5 Add wishlist count to header
    - Update header component with wishlist icon and count
    - _Requirements: 17.3_

- [x] 16. Implement Mobile Navigation
  - [x] 16.1 Create MobileBottomNav component
    - Create `components/storefront/layout/MobileBottomNav.tsx`
    - Add Home, Categories, Search, Cart buttons
    - Show cart badge count
    - _Requirements: 18.1_
  - [x] 16.2 Create MobileMegaMenu component
    - Create `components/storefront/layout/MobileMegaMenu.tsx`
    - Implement accordion-style category navigation
    - _Requirements: 18.5_
  - [x] 16.3 Add swipe gestures to image gallery
    - Update ProductImageGallery with touch support
    - _Requirements: 18.2_
  - [x] 16.4 Ensure touch target sizes
    - Audit and fix all interactive elements to 44x44px minimum
    - _Requirements: 18.4_

- [ ] 17. Checkpoint - Verify UX Features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Analytics & Tracking (High)

- [ ] 18. Implement Enhanced E-commerce Tracking
  - [ ] 18.1 Create e-commerce analytics service
    - Create `lib/analytics/ecommerce.ts`
    - Implement impression, click, add-to-cart tracking
    - Implement checkout and purchase tracking
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  - [ ] 18.2 Write property test for analytics events
    - **Property 20: Analytics events contain required data fields**
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5**
  - [ ] 18.3 Create ProductImpressionTracker component
    - Create `components/analytics/ProductImpressionTracker.tsx`
    - Use IntersectionObserver to track visibility
    - _Requirements: 19.1_
  - [ ] 18.4 Integrate tracking into product grid
    - Wrap ProductGrid with impression tracking
    - Track clicks on product cards
    - _Requirements: 19.1, 19.2_
  - [ ] 18.5 Integrate tracking into checkout flow
    - Track checkout initiation
    - Track purchase completion
    - _Requirements: 19.4, 19.5_

- [ ] 19. Implement Heatmap Integration
  - [ ] 19.1 Create HeatmapProvider component
    - Create `components/analytics/HeatmapProvider.tsx`
    - Support Clarity or Hotjar
    - Respect DNT header
    - _Requirements: 20.1, 20.5_
  - [ ] 19.2 Add scroll depth tracking
    - Track 25%, 50%, 75%, 100% scroll milestones
    - _Requirements: 20.2_
  - [ ] 19.3 Integrate heatmap provider into layout
    - Add to root layout with privacy checks
    - _Requirements: 20.1_

- [ ] 20. Checkpoint - Verify Analytics Features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: One-Click Checkout & Retention (Medium)

- [x] 21. Implement One-Click Checkout
  - [x] 21.1 Create BuyNowButton component
    - Create `components/storefront/product/BuyNowButton.tsx`
    - Skip cart and go directly to Polar checkout
    - _Requirements: 14.1_
  - [x] 21.2 Create express checkout service
    - Create `lib/checkout/express.ts`
    - Handle single-item checkout flow
    - Pre-fill email from localStorage
    - _Requirements: 14.2, 14.4_
  - [x] 21.3 Write property test for preference persistence
    - **Property 15: Customer preferences persist correctly**
    - **Validates: Requirements 14.3**
  - [x] 21.4 Integrate Buy Now into product page
    - Add BuyNowButton alongside Add to Cart
    - _Requirements: 14.1_

- [ ] 22. Implement Exit Intent Popup
  - [ ] 22.1 Create useExitIntent hook
    - Create `lib/hooks/use-exit-intent.ts`
    - Detect cursor leaving viewport
    - Respect session cookie for dismissal
    - _Requirements: 21.1, 21.3, 21.4_
  - [ ] 22.2 Create ExitIntentPopup component
    - Create `components/storefront/shared/ExitIntentPopup.tsx`
    - Display newsletter signup with discount offer
    - _Requirements: 21.1, 21.2_
  - [ ] 22.3 Integrate exit intent into layout
    - Add to frontend layout
    - Disable on mobile (use scroll trigger instead)
    - _Requirements: 21.5_

- [ ] 23. Implement Post-Purchase Upsell
  - [ ] 23.1 Create upsell recommendations service
    - Create `lib/storefront/upsell.ts`
    - Get complementary products for purchased items
    - Exclude already-purchased products
    - _Requirements: 22.1, 22.3_
  - [ ] 23.2 Write property test for upsell recommendations
    - **Property 24: Post-purchase recommendations are complementary**
    - **Validates: Requirements 22.1, 22.3**
  - [ ] 23.3 Create PostPurchaseUpsell component
    - Create `components/storefront/checkout/PostPurchaseUpsell.tsx`
    - Display on checkout success page
    - _Requirements: 22.1_
  - [ ] 23.4 Implement upsell conversion tracking
    - Track when upsell products are purchased
    - _Requirements: 22.4_
  - [ ] 23.5 Write property test for upsell tracking
    - **Property 25: Upsell conversion tracking is accurate**
    - **Validates: Requirements 22.4**

- [ ] 24. Checkpoint - Verify Checkout & Retention Features
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: Technical SEO & Polish (Medium)

- [x] 25. Implement Technical SEO Improvements
  - [x] 25.1 Enhance sitemap with full attributes
    - Update `app/sitemap.ts`
    - Add proper lastmod, changefreq, priority
    - _Requirements: 9.1_
  - [x] 25.2 Write property test for sitemap entries
    - **Property 10: Sitemap entries include required attributes**
    - **Validates: Requirements 9.1**
  - [x] 25.3 Implement sitemap index for large catalogs
    - Split sitemap if > 50,000 URLs
    - _Requirements: 9.2_
  - [x] 25.4 Verify canonical URLs on all pages
    - Audit and fix canonical URL generation
    - _Requirements: 9.4_
  - [x] 25.5 Write property test for canonical URLs
    - **Property 11: Canonical URLs are correctly formed**
    - **Validates: Requirements 9.4**
  - [x] 25.6 Update robots.txt
    - Add crawl-delay and sitemap reference
    - _Requirements: 9.5_

- [-] 26. Implement Bundle Size Optimization
  - [x] 26.1 Configure dynamic imports
    - Lazy load CartSlideOut, SearchBar, modals
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 26.2 Optimize icon imports
    - Use tree-shaking for Lucide icons
    - _Requirements: 5.4_
  - [x] 26.3 Analyze and verify bundle size
    - Run bundle analyzer
    - Verify < 200KB gzipped initial load
    - _Requirements: 5.5_

- [x] 27. Implement Cache Headers
  - [x] 27.1 Configure static asset caching
    - Add Cache-Control headers in next.config.ts
    - Set max-age=31536000, immutable for static assets
    - _Requirements: 4.1_
  - [x] 27.2 Configure API response caching
    - Add stale-while-revalidate for API routes
    - _Requirements: 4.2_
  - [x] 27.3 Add Vary headers
    - Configure proper content negotiation
    - _Requirements: 4.4_

- [ ] 28. Final Checkpoint - Complete Verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 25 correctness properties have passing tests.
  - Run Lighthouse audit to verify performance targets.

## Notes

- All tasks including property-based tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Implementation uses TypeScript with Next.js 16 App Router
- Property-based testing uses fast-check library
