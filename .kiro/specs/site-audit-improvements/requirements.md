# Requirements Document: DigiInsta Site Audit & Improvements

## Introduction

This document provides a comprehensive audit of the DigiInsta digital product store against the README blueprint, identifying implemented features, missing functionality, and suggested improvements.

## Glossary

- **Payload_CMS**: The headless CMS used for content management and authentication
- **Polar**: Payment gateway (Polar.sh) for processing transactions
- **R2**: Cloudflare R2 storage for private file hosting
- **Webhook**: Server-to-server notification for payment events
- **Signed_URL**: Time-limited secure download link

---

## AUDIT SUMMARY

### ✅ Fully Implemented Features

| Feature             | Status      | Notes                                                           |
| ------------------- | ----------- | --------------------------------------------------------------- |
| Product Management  | ✅ Complete | Products, categories, subcategories, bundles                    |
| SEO Implementation  | ✅ Complete | Meta tags, JSON-LD, sitemap, robots.txt, canonical URLs         |
| Blog System         | ✅ Complete | Posts collection, listing page, detail page with Article schema |
| Cart System         | ✅ Complete | Client-side cart with localStorage persistence                  |
| Checkout Flow       | ✅ Complete | Polar integration, checkout page, success page                  |
| Download System     | ✅ Complete | Signed URLs, download limits, expiration                        |
| Admin Dashboard     | ✅ Complete | Revenue tracking, order stats, top products                     |
| Analytics Module    | ✅ Complete | Revenue by partner, order stats, download stats                 |
| Email Templates     | ✅ Complete | Templates defined (purchase, download, failed, etc.)            |
| Storage Integration | ✅ Complete | R2 client configured, signed URL generation                     |
| Logging             | ✅ Complete | Pino logger configured                                          |
| Error Monitoring    | ✅ Complete | Sentry integration                                              |

### ⚠️ Partially Implemented Features

| Feature             | Status      | Notes                                              |
| ------------------- | ----------- | -------------------------------------------------- |
| Webhook Fulfillment | ✅ Complete | Order creation, email sending, revenue attribution |
| Revenue Attribution | ✅ Complete | createdBy field set from product creator           |
| Email Sending       | ✅ Complete | Purchase receipt + download emails triggered       |
| Static Pages        | ✅ Complete | About, Contact, FAQ pages created                  |

### ❌ Not Implemented Features (From Blueprint)

| Feature                  | Priority | Notes                             |
| ------------------------ | -------- | --------------------------------- |
| Cart Abandonment Emails  | Medium   | Requires tracking checkout starts |
| Upsell Campaigns         | Low      | Post-purchase email flow          |
| Product View Tracking    | Medium   | Analytics event tracking          |
| Checkout Funnel Tracking | Medium   | Analytics for conversion          |
| Download Event Tracking  | Low      | Already have download counts      |

---

## Requirements

### Requirement 1: Complete Webhook Order Fulfillment

**User Story:** As a customer, I want my order to be automatically created in the system when I complete payment, so that I can access my downloads immediately.

#### Acceptance Criteria

1. WHEN the `order.paid` webhook is received, THE Webhook_Handler SHALL create an Order record in Payload CMS with all item details
2. WHEN an Order is created, THE System SHALL populate the `createdBy` field with the product creator's user ID for revenue attribution
3. WHEN an Order is created, THE System SHALL send a purchase receipt email to the customer
4. WHEN an Order is created, THE System SHALL send a download email with signed URLs for all purchased items
5. IF the webhook fails to process, THEN THE System SHALL log the error and return appropriate status code for retry

### Requirement 2: Implement Cart Abandonment Tracking

**User Story:** As a store owner, I want to track abandoned carts, so that I can recover lost sales through reminder emails.

#### Acceptance Criteria

1. WHEN a checkout session is created, THE System SHALL store the checkout ID and timestamp
2. WHEN a checkout session expires without completion, THE System SHALL mark it as abandoned
3. WHEN a cart is abandoned for more than 1 hour, THE System SHALL send a cart abandonment email
4. THE System SHALL NOT send abandonment emails for completed checkouts

### Requirement 3: Implement Product View Analytics

**User Story:** As a store owner, I want to track product views, so that I can understand which products attract the most interest.

#### Acceptance Criteria

1. WHEN a user views a product page, THE System SHALL record the view event
2. THE Analytics_Dashboard SHALL display product view counts
3. THE System SHALL track unique views vs total views

### Requirement 4: Fix Revenue Attribution on Orders

**User Story:** As a store partner, I want orders to be attributed to the correct product creator, so that revenue can be accurately tracked per partner.

#### Acceptance Criteria

1. WHEN an Order is created via webhook, THE System SHALL look up the product/bundle creator
2. THE Order SHALL have its `createdBy` field set to the product creator's user ID
3. THE Revenue_Dashboard SHALL accurately show revenue per partner based on order attribution

### Requirement 5: Wire Email Sending to Webhook Events

**User Story:** As a customer, I want to receive confirmation and download emails after purchase, so that I can access my products.

#### Acceptance Criteria

1. WHEN `order.paid` webhook fires, THE System SHALL send purchase receipt email
2. WHEN `order.paid` webhook fires, THE System SHALL send download email with signed URLs
3. WHEN `order.refunded` webhook fires, THE System SHALL send refund confirmation email
4. IF email sending fails, THEN THE System SHALL log the error but not fail the webhook

---

## CODE IMPROVEMENTS

### Requirement 6: Improve Webhook Handler Robustness

**User Story:** As a developer, I want the webhook handler to be idempotent and robust, so that duplicate webhooks don't cause issues.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL check if an order already exists before creating
2. THE Webhook_Handler SHALL use database transactions where appropriate
3. THE Webhook_Handler SHALL implement proper error handling with structured logging

### Requirement 7: Add Missing Static Pages

**User Story:** As a visitor, I want to access About, Contact, and FAQ pages, so that I can learn more about the store.

#### Acceptance Criteria

1. THE System SHALL have an `/about` page with store information
2. THE System SHALL have a `/contact` page with contact form (already has API)
3. THE System SHALL have a `/help/faq` page with frequently asked questions
4. EACH page SHALL have proper SEO metadata

### Requirement 8: Optimize Database Queries

**User Story:** As a developer, I want efficient database queries, so that the site performs well under load.

#### Acceptance Criteria

1. THE Analytics_Service SHALL use aggregation queries instead of fetching all records
2. THE Product_Queries SHALL use proper indexing on frequently queried fields
3. THE System SHALL implement caching for frequently accessed data

---

## SUGGESTED IMPROVEMENTS

### Performance Improvements

1. **Add ISR (Incremental Static Regeneration)** to product pages for better performance
2. **Implement edge caching** for category and product listing pages
3. **Add database indexes** on frequently queried fields (slug, status, createdAt)

### Security Improvements

1. **Rate limit** the download endpoint to prevent abuse
2. **Add CSRF protection** to forms
3. **Implement IP-based download tracking** (partially exists)

### UX Improvements

1. **Add loading states** to all async operations
2. **Implement optimistic updates** for cart operations
3. **Add toast notifications** for user feedback

### Code Quality Improvements

1. **Add unit tests** for critical business logic (webhook handler, download verification)
2. **Add integration tests** for checkout flow
3. **Implement proper TypeScript types** for Polar webhook payloads

---

## PRIORITY MATRIX

| Priority  | Feature                      | Effort | Impact                |
| --------- | ---------------------------- | ------ | --------------------- |
| 🔴 High   | Complete webhook fulfillment | Medium | Critical for sales    |
| 🔴 High   | Wire email sending           | Low    | Critical for UX       |
| 🔴 High   | Fix revenue attribution      | Low    | Critical for business |
| 🟡 Medium | Add missing static pages     | Low    | Good for SEO/trust    |
| 🟡 Medium | Cart abandonment tracking    | Medium | Revenue recovery      |
| 🟡 Medium | Product view analytics       | Medium | Business insights     |
| 🟢 Low    | Optimize database queries    | Medium | Performance           |
| 🟢 Low    | Add tests                    | High   | Code quality          |

---

## IMMEDIATE ACTION ITEMS

1. **Complete `handleOrderPaid` webhook handler** to:
   - Create Order in Payload CMS
   - Set `createdBy` for revenue attribution
   - Send purchase receipt email
   - Send download email with signed URLs

2. **Create missing static pages**:
   - `/about`
   - `/help/faq`
   - Update `/contact` to use existing API

3. **Add proper error handling** to webhook with structured logging

4. **Test end-to-end checkout flow** with Polar sandbox
