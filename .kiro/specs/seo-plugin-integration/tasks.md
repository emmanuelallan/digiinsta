# Implementation Plan: SEO Plugin Integration

## Overview

This plan integrates the `@payloadcms/plugin-seo` plugin into the DigiInsta platform, replacing manual SEO fields with the plugin's standardized solution.

## Tasks

- [x] 1. Install and configure the SEO plugin
  - [x] 1.1 Install the @payloadcms/plugin-seo package
    - Run `bun add @payloadcms/plugin-seo`
    - _Requirements: 1.1_

  - [x] 1.2 Create SEO generation functions
    - Create `lib/seo.ts` with generateTitle, generateDescription, generateImage, and generateURL functions
    - Use proper TypeScript types from `@payloadcms/plugin-seo/types`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.3, 4.4_

  - [x] 1.3 Configure the SEO plugin in payload.config.ts
    - Import seoPlugin and generation functions
    - Add plugin to plugins array with collections, uploadsCollection, tabbedUI, and generation functions
    - _Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 5.1_

- [x] 2. Remove legacy SEO fields from collections
  - [x] 2.1 Remove legacy fields from Products collection
    - Remove metaTitle, metaDescription, and ogImage fields from collections/Products.ts
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.2 Remove legacy fields from Posts collection
    - Remove metaTitle, metaDescription, and ogImage fields from collections/Posts.ts
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.3 Remove legacy fields from Bundles collection
    - Remove metaTitle, metaDescription, and ogImage fields from collections/Bundles.ts
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Regenerate types and verify
  - [x] 3.1 Regenerate Payload types
    - Run `bun payload generate:types`
    - Verify meta field types are added to payload-types.ts
    - _Requirements: 7.1, 7.2_

- [ ] 4. Checkpoint - Verify integration
  - Ensure the build passes with `bun run build`
  - Verify SEO tab appears in admin panel for products, posts, and bundles
  - Ask the user if questions arise

- [-] 5. Write tests for SEO generation functions
  - [ ] 5.1 Write property test for title generation
    - **Property 1: Title Generation Format**
    - **Validates: Requirements 3.1**

  - [ ] 5.2 Write property test for description generation
    - **Property 2: Description Source Selection**
    - **Validates: Requirements 3.2, 3.4**

  - [ ] 5.3 Write property test for image generation
    - **Property 3: Image Source Selection**
    - **Validates: Requirements 3.3, 3.4**

  - [ ] 5.4 Write property test for URL generation
    - **Property 4: URL Generation by Collection**
    - **Validates: Requirements 4.2, 4.3, 4.4**

- [ ] 6. Final checkpoint
  - Ensure all tests pass
  - Ask the user if questions arise

## Notes

- The plugin handles the admin UI (character counters, preview) automatically
- Database migration may be needed if there's existing data in legacy fields
