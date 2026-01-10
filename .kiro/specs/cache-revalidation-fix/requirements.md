# Requirements Document

## Introduction

This feature addresses the content revalidation delays in the DigiInsta storefront. Currently, when products are updated in Payload CMS, changes can take up to 1 hour to appear on the frontend due to time-based ISR (Incremental Static Regeneration). The goal is to implement instant on-demand revalidation while maintaining the fast static site performance.

## Glossary

- **ISR**: Incremental Static Regeneration - Next.js feature that allows static pages to be regenerated after deployment
- **Revalidation**: The process of regenerating a static page with fresh data
- **On-Demand_Revalidation**: Triggering page regeneration immediately when content changes, rather than waiting for a time interval
- **Payload_CMS**: The headless CMS used for content management
- **Cache_Tag**: A label attached to cached content that allows targeted invalidation
- **Webhook**: An HTTP callback triggered by an event in another system

## Requirements

### Requirement 1: On-Demand Revalidation via Payload Hooks

**User Story:** As a content editor, I want product changes to appear on the storefront immediately after saving, so that I don't have to wait for cache expiration.

#### Acceptance Criteria

1. WHEN a product is created or updated in Payload CMS, THE Revalidation_System SHALL trigger revalidation of the product page within 5 seconds
2. WHEN a product is deleted in Payload CMS, THE Revalidation_System SHALL trigger revalidation of affected listing pages within 5 seconds
3. WHEN a category or subcategory is updated, THE Revalidation_System SHALL trigger revalidation of the category page and its product listing pages
4. WHEN revalidation is triggered, THE Revalidation_System SHALL log the operation for debugging purposes
5. IF revalidation fails, THEN THE Revalidation_System SHALL retry once and log the failure without blocking the CMS save operation

### Requirement 2: Tag-Based Cache Invalidation

**User Story:** As a developer, I want granular cache invalidation using tags, so that only affected pages are regenerated instead of the entire site.

#### Acceptance Criteria

1. THE Caching_System SHALL tag product pages with the product slug and subcategory slug
2. THE Caching_System SHALL tag category pages with the category slug
3. THE Caching_System SHALL tag listing pages (homepage, best sellers, new arrivals) with collection-level tags
4. WHEN a product is updated, THE Revalidation_System SHALL invalidate only tags related to that product
5. WHEN a category is updated, THE Revalidation_System SHALL invalidate the category tag and all child subcategory tags

### Requirement 3: Fallback Time-Based Revalidation

**User Story:** As a site owner, I want a fallback revalidation mechanism, so that pages eventually refresh even if on-demand revalidation fails.

#### Acceptance Criteria

1. THE Caching_System SHALL maintain time-based revalidation as a fallback with a 1-hour interval for product pages
2. THE Caching_System SHALL maintain time-based revalidation with a 24-hour interval for category pages
3. WHEN on-demand revalidation succeeds, THE Caching_System SHALL reset the time-based revalidation timer

### Requirement 4: Admin Feedback on Revalidation Status

**User Story:** As a content editor, I want to know when my changes are live on the storefront, so that I can verify updates without guessing.

#### Acceptance Criteria

1. WHEN a product is saved, THE Admin_UI SHALL display a notification indicating revalidation has been triggered
2. IF revalidation fails, THEN THE Admin_UI SHALL display a warning message with the failure reason
3. THE Admin_UI SHALL provide a manual "Refresh Cache" button for forcing revalidation of a specific page

### Requirement 5: Homepage and Collection Page Revalidation

**User Story:** As a site owner, I want the homepage and collection pages to update when products change, so that featured sections stay current.

#### Acceptance Criteria

1. WHEN a product with "best-seller" tag is updated, THE Revalidation_System SHALL trigger revalidation of the best sellers section
2. WHEN a product with "new-arrival" tag is updated, THE Revalidation_System SHALL trigger revalidation of the new arrivals section
3. WHEN any product is created, THE Revalidation_System SHALL trigger revalidation of the new arrivals section
4. WHEN a product's status changes to "active" or "archived", THE Revalidation_System SHALL trigger revalidation of all affected listing pages
