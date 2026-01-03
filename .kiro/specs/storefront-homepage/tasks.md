# Implementation Plan: DigiInsta Storefront Homepage

## Overview

This implementation plan covers building the customer-facing storefront homepage for DigiInsta. The implementation follows a mobile-first approach using shadcn/ui components and HugeIcons, with Server Components as the default rendering strategy.

## Tasks

- [x] 1. Install shadcn/ui components and dependencies
  - [x] 1.1 Install core shadcn/ui components
    - Run shadcn CLI to add: button, card, badge, input, dialog, sheet, navigation-menu, command, scroll-area, skeleton, separator, aspect-ratio, carousel
    - _Requirements: 9.1_
  - [x] 1.2 Install HugeIcons package
    - Add @hugeicons/react and @hugeicons/core-free-icons
    - _Requirements: 9.2_

- [x] 2. Create storefront types and utilities
  - [x] 2.1 Create storefront type definitions
    - Create `types/storefront.ts` with Product, Category, Bundle, Persona interfaces
    - _Requirements: 4.5, 7.1_
  - [x] 2.2 Create data fetching utilities
    - Create `lib/storefront/products.ts` for product queries
    - Create `lib/storefront/categories.ts` for category queries
    - _Requirements: 4.1, 4.2, 4.3, 7.3_

- [x] 3. Build shared storefront components
  - [x] 3.1 Create SectionHeader component
    - Reusable section title with optional "View All" link
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 3.2 Create ProductCard component
    - Display thumbnail, title, price, badges
    - Include hover effects and quick-add button
    - _Requirements: 4.5, 4.6_
  - [x] 3.3 Create ProductGrid component
    - Responsive grid layout for product listings
    - _Requirements: 4.4, 8.1_

- [x] 4. Build mega menu navigation
  - [x] 4.1 Create MegaMenu component
    - Desktop dropdown with categories, subcategories, featured products
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 4.2 Create MobileNav component
    - Slide-out drawer navigation for mobile
    - _Requirements: 1.5, 1.6_
  - [x] 4.3 Update Header component with mega menu
    - Integrate MegaMenu and MobileNav into existing header
    - Add navigation items: Shop, Personas, Bundles, Blog
    - _Requirements: 1.1, 1.4_

- [x] 5. Build dynamic search
  - [x] 5.1 Create SearchBar component
    - Real-time search suggestions with thumbnails
    - Keyboard navigation support
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 5.2 Create search API route
    - Server action for product/category search
    - _Requirements: 6.1, 6.5_
  - [x] 5.3 Integrate SearchBar into Header
    - Add search to desktop and mobile navigation
    - _Requirements: 6.1_

- [x] 6. Build homepage hero section
  - [x] 6.1 Create HeroSection component
    - Full-width hero with background image/video
    - Headline, subheadline, and CTA buttons
    - Responsive layout for all screen sizes
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Build persona cards section
  - [x] 7.1 Create PersonaCard component
    - Individual persona card with icon, title, description, image
    - Hover effects and link to filtered products
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 7.2 Create PersonaCards section
    - Three-column layout for Student, Professional, Couple
    - Responsive grid for mobile
    - _Requirements: 3.1, 3.5_

- [x] 8. Build product tray sections
  - [x] 8.1 Create ProductTray component
    - Horizontal scrollable carousel on mobile
    - Grid layout on desktop
    - _Requirements: 4.4, 8.8_
  - [x] 8.2 Create NewArrivals section
    - Fetch and display recently added products
    - _Requirements: 4.1_
  - [x] 8.3 Create EditorsPick section
    - Fetch and display featured/editor's pick products
    - _Requirements: 4.2_
  - [x] 8.4 Create BestSellers section
    - Fetch and display top-selling products
    - _Requirements: 4.3_

- [x] 9. Build bundle promotion banner
  - [x] 9.1 Create BundleBanner component
    - Eye-catching banner with savings messaging
    - CTA button linking to bundles page
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Build category showcase section
  - [x] 10.1 Create CategoryCard component
    - Category card with icon, title, and product count
    - _Requirements: 7.1, 7.2_
  - [x] 10.2 Create CategoryShowcase section
    - Display main categories in grid layout
    - _Requirements: 7.1_

- [x] 11. Assemble homepage
  - [x] 11.1 Update homepage page.tsx
    - Compose all sections: Hero, Personas, NewArrivals, BundleBanner, EditorsPick, BestSellers, CategoryShowcase
    - Implement proper section spacing and layout
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 7.1_
  - [x] 11.2 Update storefront layout
    - Ensure header and footer are properly integrated
    - Add proper metadata and SEO tags
    - _Requirements: 8.1, 9.4_

- [x] 12. Build product quick view
  - [x] 12.1 Create QuickView modal component
    - Product preview in modal dialog
    - Image gallery, description, add to cart
    - _Requirements: 10.1, 10.2_
  - [x] 12.2 Integrate QuickView into ProductCard
    - Add quick view button/trigger to product cards
    - _Requirements: 10.2_

- [x] 13. Mobile optimizations
  - [x] 13.1 Implement sticky add-to-cart
    - Sticky bottom bar on product pages for mobile
    - _Requirements: 8.2_
  - [x] 13.2 Add touch gesture support
    - Swipe gestures for carousels
    - _Requirements: 8.5_
  - [x] 13.3 Verify touch targets
    - Ensure all interactive elements meet 44px minimum
    - _Requirements: 8.4_

- [x] 14. Final polish and testing
  - [x] 14.1 Add loading states
    - Skeleton loaders for all data-fetching components
    - _Requirements: 9.1_
  - [x] 14.2 Add empty states
    - Handle empty product lists, search results
    - _Requirements: 6.5_
  - [x] 14.3 Verify responsive design
    - Test all breakpoints and fix any layout issues
    - _Requirements: 8.1_
  - [x] 14.4 Verify theme support
    - Test light and dark mode across all components
    - _Requirements: 9.3_

## Notes

- All components should be Server Components by default, with "use client" only where interactivity is required
- Use HugeIcons consistently throughout the storefront
- Follow mobile-first responsive design principles
- Ensure all images use Next.js Image component for optimization
- Product data should be fetched from Payload CMS collections
- Implement proper error boundaries for data fetching failures
