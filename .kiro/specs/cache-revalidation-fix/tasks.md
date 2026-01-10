# Implementation Plan: Cache Revalidation Fix

## Overview

This plan implements on-demand revalidation for the DigiInsta storefront, triggered directly from Payload CMS hooks. The implementation is structured to build the core revalidation service first, then integrate it with Payload collections.

## Tasks

- [x] 1. Create revalidation service core
  - [x] 1.1 Create `lib/revalidation/tags.ts` with tag constants and utilities
    - Define TAG_PREFIXES for each content type
    - Define COLLECTION_TAGS for listing pages
    - Create `getProductTags(slug, subcategorySlug, categorySlug)` function
    - Create `getCategoryTags(slug)` function
    - Create `getCollectionTagsForProduct(tags)` function to map product tags to collection tags
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.2 Create `lib/revalidation/paths.ts` with path computation logic
    - Create `getProductPaths(slug, subcategory)` function
    - Create `getCategoryPaths(slug)` function
    - Create `getSubcategoryPaths(slug, categorySlug)` function
    - Create `getBundlePaths(slug)` function
    - Create `getPostPaths(slug)` function
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.3 Write property test for path computation
    - **Property 1: Path Computation Correctness**
    - Test that computed paths always include direct page path
    - Test that parent listing pages are included
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 1.4 Write property test for tag generation
    - **Property 2: Tag Generation Correctness**
    - Test that tags include item's own identifier
    - Test that ancestor tags are included
    - **Validates: Requirements 2.1, 2.2**

- [x] 2. Implement revalidation trigger service
  - [x] 2.1 Create `lib/revalidation/service.ts` with main revalidation logic
    - Create `RevalidationContext` interface
    - Create `RevalidationResult` interface
    - Implement `computePathsToRevalidate(context)` using path utilities
    - Implement `computeTagsToInvalidate(context)` using tag utilities
    - Implement `triggerRevalidation(context)` with retry logic
    - _Requirements: 1.1, 1.5, 2.4, 2.5_

  - [x] 2.2 Write property test for tag invalidation scope
    - **Property 3: Tag Invalidation Scope**
    - Test that invalidated tags are subset of all tags
    - Test that only related content tags are invalidated
    - **Validates: Requirements 2.4, 2.5**

  - [x] 2.3 Write property test for collection page revalidation
    - **Property 4: Collection Page Revalidation**
    - Test products with best-seller tag trigger best sellers collection
    - Test products with new-arrival tag trigger new arrivals collection
    - **Validates: Requirements 5.1, 5.2**

  - [x] 2.4 Write property test for creation triggers
    - **Property 5: Creation Triggers New Arrivals**
    - Test that new products always trigger new arrivals revalidation
    - **Validates: Requirements 5.3**

- [x] 3. Implement Payload hooks
  - [x] 3.1 Create `lib/revalidation/hooks.ts` with Payload hook factories
    - Create `createRevalidationAfterChangeHook(collection)` factory
    - Create `createRevalidationAfterDeleteHook(collection)` factory
    - Handle status change detection (previousDoc comparison)
    - Ensure hooks are non-blocking (fire and forget with error handling)
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 3.2 Write property test for status change handling
    - **Property 6: Status Change Triggers Listing Updates**
    - Test active→archived triggers listing page revalidation
    - Test draft→active triggers listing page revalidation
    - **Validates: Requirements 5.4**

  - [x] 3.3 Write property test for retry behavior
    - **Property 7: Retry on Failure**
    - Test that failures trigger exactly one retry
    - Test that failures don't block hook completion
    - **Validates: Requirements 1.5**

- [x] 4. Integrate hooks with Payload collections
  - [x] 4.1 Add revalidation hooks to Products collection
    - Import hook factories
    - Add afterChange hook
    - Add afterDelete hook
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Add revalidation hooks to Categories collection
    - Add afterChange hook
    - Add afterDelete hook
    - _Requirements: 1.3_

  - [x] 4.3 Add revalidation hooks to Subcategories collection
    - Add afterChange hook
    - Add afterDelete hook
    - _Requirements: 1.3_

  - [x] 4.4 Add revalidation hooks to Bundles collection
    - Add afterChange hook
    - Add afterDelete hook
    - _Requirements: 1.1_

  - [x] 4.5 Add revalidation hooks to Posts collection
    - Add afterChange hook
    - Add afterDelete hook
    - _Requirements: 1.1_

- [x] 5. Checkpoint - Verify revalidation works
  - Test by updating a product in Payload admin
  - Verify the product page updates immediately
  - Check logs for revalidation entries
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Add cache tags to frontend pages
  - [x] 6.1 Update product page to use unstable_cache with tags
    - Import `unstable_cache` from next/cache
    - Wrap data fetching with cache tags
    - Add product-specific and collection tags
    - _Requirements: 2.1, 2.3_

  - [x] 6.2 Update category pages to use cache tags
    - Add category-specific tags
    - _Requirements: 2.2_

  - [x] 6.3 Update homepage sections to use collection tags
    - Tag best sellers section with `collection:best-sellers`
    - Tag new arrivals section with `collection:new-arrivals`
    - Tag editors picks section with `collection:editors-picks`
    - _Requirements: 2.3_

- [x] 7. Add admin feedback
  - [x] 7.1 Create toast notification component for Payload admin
    - Show success message after revalidation
    - Show warning on failure
    - _Requirements: 4.1, 4.2_

  - [x] 7.2 Add manual refresh cache button to product edit view
    - Create custom Payload field component
    - Trigger revalidation on click
    - _Requirements: 4.3_

- [x] 8. Final checkpoint
  - Run full test suite
  - Test end-to-end: edit product → verify immediate update on frontend
  - Verify fallback time-based revalidation still works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Cleanup
  - [x] 9.1 Remove or simplify the webhook revalidation route
    - The `/api/webhooks/revalidate` route is no longer needed
    - Can keep as manual trigger endpoint or remove entirely
    - _Requirements: N/A (cleanup)_

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
