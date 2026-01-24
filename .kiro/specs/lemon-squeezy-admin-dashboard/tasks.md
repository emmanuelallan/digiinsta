# Implementation Plan: Lemon Squeezy Admin Dashboard

## Overview

This implementation plan breaks down the Lemon Squeezy Admin Dashboard into discrete, incremental coding tasks. The approach follows a bottom-up strategy: starting with database schema and core services, then building API routes, and finally implementing the UI components. Each task builds on previous work, ensuring no orphaned code and enabling early validation.

**Note**: All testing tasks have been removed to accelerate MVP development. Focus is on building working functionality with proper error handling.

## Tasks

- [x] 1. Set up project infrastructure and database schema
  - Install required dependencies (Drizzle ORM, drizzle-kit, @aws-sdk/client-s3 for R2)
  - Initialize Drizzle with PostgreSQL configuration
  - Create Drizzle schema with all models (Product, ProductType, Format, Occasion, Collection, Session, OTP)
  - Create migration files and run initial migration
  - Set up database connection and client
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 2. Implement authentication system
  - [x] 2.1 Create authentication service and session management
    - Implement `AuthenticationService` with email validation, OTP generation, and verification
    - Implement `SessionManager` for creating, validating, and invalidating sessions
    - Create utility functions for OTP generation (6-digit codes) and session token generation
    - _Requirements: 1.2, 1.3, 1.5, 1.6, 7.1, 7.5_
  
  - [x] 2.2 Create authentication API routes
    - Implement `POST /api/auth/send-otp` endpoint
    - Implement `POST /api/auth/verify-otp` endpoint
    - Implement `POST /api/auth/logout` endpoint
    - Implement `GET /api/auth/session` endpoint for session validation
    - _Requirements: 1.2, 1.5, 7.5_

- [x] 3. Implement email service integration
  - [x] 3.1 Set up Resend email service
    - Create email service client with Resend API key from env
    - Implement `sendOTP` function to send OTP emails
    - Create email template for OTP delivery
    - _Requirements: 1.2_

- [x] 4. Implement authentication middleware
  - [x] 4.1 Create auth middleware for protecting routes
    - Implement middleware to validate session tokens from cookies
    - Add redirect logic for unauthenticated requests
    - Apply middleware to all `/admin` routes except login
    - _Requirements: 1.9, 7.2, 7.3_

- [x] 5. Implement Lemon Squeezy API client
  - [x] 5.1 Create Lemon Squeezy client service
    - Implement `LemonSqueezyClient` with API authentication using env variables
    - Implement `fetchAllProducts` method to retrieve all products
    - Implement `fetchProductImages` method to get all images for a product
    - Add error handling for API failures and rate limiting
    - _Requirements: 2.2, 2.3_

- [x] 6. Implement product synchronization service
  - [x] 6.1 Create product sync service and repository
    - Implement `ProductRepository` with Drizzle database operations (create, find, update)
    - Implement `ProductSyncService` to orchestrate sync operations
    - Add duplicate detection logic using Lemon Squeezy ID
    - Implement sync result tracking (new products, skipped products, errors)
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [x] 6.2 Create product sync API route
    - Implement `POST /api/products/sync` endpoint
    - Add authentication check using auth middleware
    - Return sync results with counts and errors
    - _Requirements: 2.2, 2.7, 2.8_

- [x] 7. Implement product retrieval API routes
  - [x] 7.1 Create product listing and detail endpoints
    - Implement `GET /api/products` to retrieve all products with enhancement status
    - Implement `GET /api/products/:id` to get single product with full details
    - Add enhancement status calculation (check if taxonomies are associated)
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Checkpoint - Ensure backend services are working
  - Test API endpoints manually using Postman or curl
  - Verify database schema and data integrity
  - Test authentication flow end-to-end
  - Ask the user if questions arise

- [x] 9. Implement taxonomy management service
  - [x] 9.1 Create taxonomy service and repository
    - Implement `TaxonomyRepository` for CRUD operations on all taxonomy types using Drizzle
    - Implement `TaxonomyService` for creating simple and complex taxonomies
    - Add image upload handling for complex taxonomies using Cloudflare R2
    - Implement validation for required fields
    - _Requirements: 5.3, 5.7, 6.3, 6.7, 6.9, 6.10_
  
  - [x] 9.2 Create taxonomy API routes
    - Implement `POST /api/taxonomies/product-types` endpoint
    - Implement `POST /api/taxonomies/formats` endpoint
    - Implement `POST /api/taxonomies/occasions` endpoint (with image upload to R2)
    - Implement `POST /api/taxonomies/collections` endpoint (with image upload to R2)
    - Implement `GET /api/taxonomies/:type` endpoint to retrieve taxonomies by type
    - _Requirements: 5.3, 5.7, 6.3, 6.7_

- [x] 10. Implement product enhancement service
  - [x] 10.1 Create product enhancement service
    - Implement `ProductEnhancementService` for associating taxonomies with products
    - Implement `ProductTaxonomyRepository` for managing associations using Drizzle
    - Add atomic transaction support for saving multiple associations
    - Implement product retrieval with all associated taxonomies
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8, 10.6_
  
  - [x] 10.2 Create product enhancement API routes
    - Implement `PUT /api/products/:id/enhance` endpoint
    - Implement `GET /api/products/:id/enhanced` endpoint
    - Add validation for taxonomy IDs
    - _Requirements: 4.8, 4.9, 4.10_

- [ ] 11. Checkpoint - Ensure all backend functionality is complete
  - Test all API endpoints manually
  - Verify database operations and data integrity
  - Test error handling and edge cases
  - Ask the user if questions arise

- [x] 12. Implement authentication UI components
  - [x] 12.1 Create login page and OTP verification
    - Create `/admin/page.tsx` with email input form
    - Implement OTP sending logic with loading states
    - Add conditional OTP input field after email submission
    - Implement OTP verification with session cookie storage
    - Add error and success message displays
    - Style using shadcn UI components (Input, Button, Card, Alert)
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_

- [x] 13. Implement dashboard page with product list
  - [x] 13.1 Create dashboard page and product list
    - Create `/admin/dashboard/page.tsx` with product list layout
    - Implement "Resync Products" button with loading state
    - Create `ProductCard` component to display product info and enhancement status
    - Add empty state message when no products exist
    - Implement navigation to product edit page on card click
    - Style using shadcn UI components (Button, Card, Badge, Skeleton)
    - _Requirements: 2.1, 2.7, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 14. Implement reusable UI components
  - [x] 14.1 Create taxonomy selector component
    - Create `TaxonomySelector` component with dropdown and "+" button
    - Support single and multiple selection modes
    - Implement `onAddNew` callback for opening creation dialog
    - Style using shadcn UI Select component
    - _Requirements: 4.3, 5.1, 5.5, 6.1, 6.5_
  
  - [x] 14.2 Create taxonomy dialog component
    - Create `TaxonomyDialog` component with dynamic fields based on taxonomy type
    - Implement simple taxonomy form (title only)
    - Implement complex taxonomy form (title, description, image upload)
    - Add form validation and error display
    - Style using shadcn UI Dialog, Input, Textarea, and Button components
    - _Requirements: 5.2, 5.6, 6.2, 6.6, 6.9_
  
  - [x] 14.3 Create image carousel component
    - Create `ImageCarousel` component for displaying product images
    - Implement navigation between images (prev/next buttons)
    - Add image indicators for current position
    - Style using shadcn UI Carousel component
    - _Requirements: 4.2_

- [x] 15. Implement product edit page
  - [x] 15.1 Create product enhancement interface
    - Create `/admin/products/[id]/page.tsx` with product edit layout
    - Display product images using ImageCarousel component
    - Add TaxonomySelector components for Product Type, Formats, Occasion, and Collection
    - Implement "Save" button with loading state
    - Add success and error message displays using toast notifications
    - Handle taxonomy creation via TaxonomyDialog
    - Update selectors immediately after creating new taxonomies
    - Style using shadcn UI components (Card, Button, Alert)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 5.4, 5.8, 6.4, 6.8_

- [x] 16. Implement error handling and user feedback
  - [x] 16.1 Add global error handling and feedback components
    - Set up toast notification system using shadcn UI Sonner component
    - Implement loading indicators for all async operations
    - Add error boundary component for catching React errors
    - Ensure all forms display validation errors inline
    - Add success messages for all successful operations
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_

- [x] 17. Implement UI accessibility and navigation
  - [x] 17.1 Add navigation and accessibility features
    - Create navigation header with logout button
    - Add breadcrumb navigation for product edit page
    - Ensure all form fields have proper labels
    - Implement modal dialog behavior (focus trap, ESC to close)
    - Add keyboard navigation support for all interactive elements
    - _Requirements: 9.5, 9.6, 9.8_

- [x] 18. Implement session management cleanup
  - [x] 18.1 Add session cleanup and expiration handling
    - Create API route for cleaning expired sessions
    - Implement automatic session refresh on activity
    - Add logout functionality to navigation
    - Handle session expiration gracefully with redirect to login
    - _Requirements: 7.3, 7.5_

- [x] 19. Final integration and polish
  - [x] 19.1 Integration testing and bug fixes
    - Test complete user flows (login → sync → enhance → save)
    - Test error recovery scenarios
    - Verify all loading states and feedback messages
    - Test responsive design on different screen sizes
    - Fix any bugs discovered during integration testing
    - _Requirements: All_
  
  - [x] 19.2 Performance optimization
    - Add image optimization for product and taxonomy images
    - Implement pagination or virtual scrolling for large product lists
    - Add caching for taxonomy data
    - Optimize database queries with proper indexes
    - _Requirements: 3.1, 4.2_
  
  - [x] 19.3 Documentation and deployment preparation
    - Update README with setup instructions
    - Document environment variables
    - Add API documentation for all endpoints
    - Create deployment guide for Vercel
    - Set up database migrations for production
    - _Requirements: All_

- [ ] 20. Final checkpoint - Complete system verification
  - Test complete user workflows end-to-end
  - Verify all requirements are met
  - Ensure all error handling is working correctly
  - Ask the user if questions arise

## Notes

- All testing tasks have been removed for faster MVP development
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation follows a bottom-up approach: database → services → API → UI
- All code should use TypeScript for type safety
- Use Bun as the package manager (not npm)
- Use Drizzle ORM for all database operations
- Use Cloudflare R2 for image storage
- Use Resend for email delivery
- Follow Next.js 14+ App Router conventions
- Use shadcn UI components for consistent design
