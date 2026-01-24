# Implementation Plan: Digital Love Storefront

## Overview

This implementation plan breaks down the Digital Love Storefront into discrete coding tasks. The approach follows a bottom-up strategy: starting with core data models and utilities, then building reusable components, and finally assembling complete pages.

## Tasks

- [x] 1. Set up project structure and core utilities
  - Create directory structure for components, lib, and app routes
  - Set up TypeScript interfaces for Product, Collection, ProductImage, Badge, Taxonomy, FAQ, Step, EmailSubscription
  - Implement utility functions for email validation, price formatting, and slug validation
  - Configure Tailwind CSS with brand colors (soft pinks, whites, warm grays)
  - _Requirements: 9.1, 10.1_

- [x] 2. Implement database query functions
  - [x] 2.1 Create product query functions in lib/db/products.ts
    - Implement getProductBySlug, getProductsByCollection, getBestSellerProducts, getRelatedProducts, getFeaturedProducts
    - Handle database errors gracefully with try-catch
    - _Requirements: 2.2, 5.1, 5.4_
  
  - [x] 2.2 Create collection query functions in lib/db/collections.ts
    - Implement getAllCollections, getCollectionBySlug
    - Handle database errors gracefully
    - _Requirements: 2.1, 2.6_
  
  - [x] 2.3 Create email subscription functions in lib/db/email.ts
    - Implement subscribeEmail, isEmailSubscribed
    - Handle duplicate email errors
    - _Requirements: 10.2_

- [x] 3. Implement Lemon Squeezy integration
  - Create lib/lemon-squeezy/checkout.ts with generateCheckoutUrl and openCheckoutOverlay functions
  - Handle checkout URL generation with product ID and variant ID
  - Configure redirect URLs for post-purchase flow
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 4. Build shared UI components
  - [x] 4.1 Create Badge component
    - Display badge text with icon
    - Support badge types: bestseller, valentine, editable, instant, new
    - Style with brand colors
    - _Requirements: 2.4, 3.2_
  
  - [x] 4.2 Create ProductCard component
    - Display product image, name, price, badges
    - Handle click navigation to product detail page
    - Implement hover effects
    - _Requirements: 2.4, 8.2_
  
  - [x] 4.3 Create Button component
    - Support primary and secondary variants
    - Handle loading states
    - Implement accessible button patterns
    - _Requirements: 1.1, 3.8_
  
  - [x] 4.4 Create Input component
    - Support text and email input types
    - Display validation errors
    - Implement accessible input patterns
    - _Requirements: 1.6, 10.1_

- [x] 5. Build header and footer components
  - [x] 5.1 Create Header component
    - Display logo with link to homepage
    - Display navigation links (Shop, Valentine's, About, Journal, Contact)
    - Implement mobile responsive menu
    - _Requirements: 8.4, 8.5_
  
  - [x] 5.2 Create Footer component
    - Display navigation links
    - Display copyright information
    - _Requirements: 1.7_

- [x] 6. Build homepage components
  - [x] 6.1 Create HeroSection component
    - Display headline, subheadline, supporting text
    - Display maximum two CTA buttons
    - Support hero image or video
    - _Requirements: 1.1_
  
  - [x] 6.2 Create CollectionCards component
    - Display four collection cards (Self-Love, Couples, Family, Friendship)
    - Display collection icon, title, and emotional description
    - Handle click navigation to collection pages
    - _Requirements: 1.2, 8.1_
  
  - [x] 6.3 Create ValentineHighlight component
    - Display section title and description
    - Display 3-4 featured products using ProductCard
    - Display CTA to Valentine's collection
    - _Requirements: 1.3_
  
  - [x] 6.4 Create HowItWorks component
    - Display section title
    - Display exactly three steps with descriptions
    - Display micro-text about instant download
    - _Requirements: 1.4_
  
  - [x] 6.5 Create BestSellers component
    - Display section title
    - Display 3-4 best-selling products using ProductCard
    - Display CTA to best sellers collection
    - _Requirements: 1.5_
  
  - [x] 6.6 Create WhyPeopleLove component
    - Display section title
    - Display three value points with icons
    - _Requirements: 1.5_
  
  - [x] 6.7 Create EmailCapture component
    - Display title and description
    - Display email input field and submit button
    - Handle form submission with validation
    - Display success and error messages
    - _Requirements: 1.6, 10.1, 10.3, 10.4_

- [x] 7. Build homepage page
  - Create app/(storefront)/page.tsx
  - Fetch featured products and best sellers from database
  - Compose all homepage components in correct order
  - Implement SEO meta tags
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.1_

- [x] 8. Build collection page components
  - [x] 8.1 Create CollectionHero component
    - Display collection name and emotional description
    - Style with brand aesthetic
    - _Requirements: 2.1_
  
  - [x] 8.2 Create ProductGrid component
    - Display products in 3-4 column grid
    - Support responsive layout (mobile, tablet, desktop)
    - Handle empty state when no products
    - _Requirements: 2.3_
  
  - [x] 8.3 Create FilterSort component
    - Display filter controls for price range
    - Display sort controls (price, popularity, newest)
    - Only show when collection has more than 12 products
    - Handle filter and sort changes
    - _Requirements: 2.5_

- [x] 9. Build collection page
  - Create app/(storefront)/collections/[slug]/page.tsx
  - Fetch collection by slug from database
  - Fetch products matching collection taxonomy
  - Compose CollectionHero, FilterSort, and ProductGrid components
  - Implement SEO meta tags
  - Handle 404 for invalid collection slugs
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 7.1_

- [x] 10. Build product detail page components
  - [x] 10.1 Create ImageCarousel component
    - Display 4-6 product images in carousel
    - Support navigation between images (prev/next buttons, thumbnails)
    - Support image types: lifestyle, overview, sample, editable, printable, gift
    - Implement accessible carousel patterns
    - _Requirements: 3.1_
  
  - [x] 10.2 Create ProductInfo component
    - Display product title, price, sale price (if applicable)
    - Display maximum three badges
    - Display 1-2 sentence emotional promise
    - Display micro-text about instant download
    - _Requirements: 3.2_
  
  - [x] 10.3 Create BuyNowButton component
    - Display primary CTA button
    - Handle click to open Lemon Squeezy checkout overlay
    - Pass correct product ID and variant ID
    - Handle loading and error states
    - _Requirements: 3.8, 4.1, 4.2_
  
  - [x] 10.4 Create WhatsIncluded component
    - Display section title
    - Display bullet list of deliverables
    - _Requirements: 3.3_
  
  - [x] 10.5 Create WhyItWorks component
    - Display section title
    - Display exactly three emotional value statements
    - _Requirements: 3.4_
  
  - [x] 10.6 Create HowToUse component
    - Display section title
    - Display exactly three simple steps
    - Display reassurance text
    - _Requirements: 3.5_
  
  - [x] 10.7 Create RelatedProducts component
    - Display section title
    - Display 2-3 related products using ProductCard
    - Handle click navigation to related product pages
    - _Requirements: 3.6, 8.3_
  
  - [x] 10.8 Create FAQ component
    - Display section title
    - Display 3-5 questions and answers
    - Support expandable/collapsible FAQ items
    - _Requirements: 3.7_
  
  - [x] 10.9 Create VariantSelector component (if applicable)
    - Display variant options (size, color, etc.)
    - Handle variant selection
    - Update checkout URL with selected variant
    - _Requirements: 4.5_

- [x] 11. Build product detail page
  - Create app/(storefront)/products/[slug]/page.tsx
  - Fetch product by slug from database
  - Fetch related products from database
  - Compose all product detail components in correct order
  - Implement SEO meta tags and structured data markup
  - Handle 404 for invalid product slugs
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 7.1, 7.2_

- [x] 12. Build thank you page
  - Create app/(storefront)/thank-you/page.tsx
  - Display purchase confirmation message
  - Display instructions for accessing digital products
  - Display navigation back to homepage or collections
  - _Requirements: 4.4_

- [x] 13. Implement email subscription API route
  - Create app/api/email-subscribe/route.ts
  - Validate email format
  - Check for duplicate subscriptions
  - Store email in database
  - Return success or error response
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 14. Implement SEO and accessibility features
  - [x] 14.1 Add meta tags to all pages
    - Implement generateMetadata function for each page
    - Include title, description, Open Graph data
    - _Requirements: 7.1_
  
  - [x] 14.2 Add structured data to product pages
    - Implement JSON-LD structured data for products
    - Include price, availability, image, description
    - _Requirements: 7.2_
  
  - [x] 14.3 Add alt text to all images
    - Ensure all Image components have descriptive alt text
    - Generate alt text from product data where applicable
    - _Requirements: 7.4_
  
  - [x] 14.4 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Implement focus styles
    - Test tab order
    - _Requirements: 7.5_

- [x] 15. Implement responsive design and mobile optimization
  - [x] 15.1 Add responsive breakpoints to all components
    - Implement mobile-first responsive styles
    - Test at breakpoints: 320px, 768px, 1024px, 1440px
    - _Requirements: 6.4_
  
  - [x] 15.2 Optimize images with Next.js Image component
    - Replace all img tags with Next.js Image component
    - Configure image sizes and formats
    - Implement lazy loading
    - _Requirements: 6.2, 6.5_
  
  - [x] 15.3 Implement lazy loading for product grids
    - Add intersection observer for product grids
    - Load products as user scrolls
    - _Requirements: 6.3_

- [x] 16. Implement error handling and 404 pages
  - Create app/(storefront)/not-found.tsx for 404 page
  - Add error boundaries to catch component errors
  - Implement fallback UI for image loading failures
  - Add error handling to checkout overlay
  - _Requirements: Error Handling section_

- [x] 17. Final integration and polish
  - [x] 17.1 Wire all pages together with consistent navigation
    - Verify all navigation links work correctly
    - Verify logo navigation to homepage
    - Verify collection and product navigation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 17.2 Verify brand aesthetic consistency
    - Check color palette usage across all pages
    - Check typography consistency
    - Check spacing and layout consistency
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [x] 17.3 Verify no shopping cart implementation
    - Confirm no cart UI or functionality exists
    - Confirm direct checkout flow works
    - _Requirements: 4.6_
  
  - [x] 17.4 Verify no popups on first visit
    - Test first visit experience
    - Confirm no modal or popup appears
    - _Requirements: 9.5_

## Notes

- Each task references specific requirements for traceability
- The implementation follows a bottom-up approach: utilities → components → pages
- Focus on clean, minimal code that matches the brand aesthetic
- Prioritize mobile-first responsive design
- Keep copy emotional and simple throughout
