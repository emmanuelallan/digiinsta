# Implementation Plan: Email System

## Overview

Implement a complete email system for DigiInsta including failed payment handling, Payload CMS email adapter, newsletter management, broadcast campaigns, cart abandonment recovery, and post-purchase upsells.

## Tasks

- [x] 1. Install dependencies and configure Payload email adapter
  - Install `@payloadcms/email-resend` package
  - Configure email adapter in `payload.config.ts`
  - Test admin password reset functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [-] 2. Add failed payment webhook handler
  - [x] 2.1 Add `checkout.failed` and `order.failed` cases to webhook switch
    - Extract customer email and checkout/order ID
    - Call `sendEmail` with failed payment template
    - _Requirements: 1.1, 1.2_
  - [-] 2.2 Write property test for failed payment email content
    - **Property 3: Email Templates Contain Required Fields**
    - **Validates: Requirements 1.2**

- [ ] 3. Checkpoint - Verify webhook and email adapter
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create AbandonedCheckouts collection
  - [ ] 4.1 Create collection schema in `collections/AbandonedCheckouts.ts`
    - Fields: polarCheckoutId, email, items, checkoutUrl, status, createdAt, emailSentAt
    - Add to payload.config.ts collections array
    - _Requirements: 5.1_
  - [ ] 4.2 Update webhook to track checkout sessions
    - Modify `handleCheckoutUpdated` to create/update abandoned checkout records
    - _Requirements: 5.1_
  - [ ] 4.3 Write property test for checkout tracking
    - **Property 9: Checkout Sessions Tracked**
    - **Validates: Requirements 5.1**

- [ ] 5. Create ScheduledEmails collection
  - [ ] 5.1 Create collection schema in `collections/ScheduledEmails.ts`
    - Fields: orderId, email, type, scheduledFor, status, sentAt
    - Add to payload.config.ts collections array
    - _Requirements: 6.1_

- [ ] 6. Create EmailCampaigns collection
  - [ ] 6.1 Create collection schema in `collections/EmailCampaigns.ts`
    - Fields: subject, template, recipientCount, sentAt, sentBy
    - Add to payload.config.ts collections array
    - _Requirements: 4.4_

- [ ] 7. Checkpoint - Verify new collections
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement newsletter subscription API
  - [ ] 8.1 Create `app/api/newsletter/route.ts` with POST handler
    - Validate email format
    - Check for existing subscription
    - Create subscriber with status "active"
    - Send welcome email
    - _Requirements: 3.2, 3.4, 3.5_
  - [ ] 8.2 Add DELETE handler for unsubscribe
    - Validate unsubscribe token
    - Update subscriber status to "unsubscribed"
    - _Requirements: 3.3_
  - [ ] 8.3 Add welcome email template to `lib/email.ts`
    - Include unsubscribe link
    - _Requirements: 3.5_
  - [ ] 8.4 Write property tests for subscription management
    - **Property 4: Subscription State Transitions**
    - **Property 5: Duplicate Subscriptions Prevented**
    - **Property 6: Welcome Emails on Subscription**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

- [ ] 9. Implement broadcast email system
  - [ ] 9.1 Create `app/api/admin/broadcast/route.ts`
    - Require admin authentication
    - Query active subscribers only
    - Send emails in batches
    - Log campaign to EmailCampaigns collection
    - _Requirements: 4.2, 4.4_
  - [ ] 9.2 Add broadcast function to `lib/email.ts`
    - `sendBroadcast(options)` function
    - Include unsubscribe link in all emails
    - _Requirements: 4.5_
  - [ ] 9.3 Write property tests for broadcast system
    - **Property 7: Broadcasts Only Reach Active Subscribers**
    - **Property 8: Broadcast Campaigns Logged**
    - **Validates: Requirements 4.2, 4.4**

- [ ] 10. Checkpoint - Verify newsletter and broadcast
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement cart abandonment cron job
  - [ ] 11.1 Create `app/api/cron/cart-abandonment/route.ts`
    - Query abandoned checkouts > 1 hour old with status "pending"
    - Skip if status is "completed" or "email_sent"
    - Send cart abandonment email
    - Update status to "email_sent"
    - _Requirements: 5.2, 5.4, 5.5_
  - [ ] 11.2 Add cart abandonment email template
    - Include cart items and checkout link
    - Include unsubscribe link
    - _Requirements: 5.3_
  - [ ] 11.3 Configure Vercel cron in `vercel.json`
    - Schedule: every hour
    - _Requirements: 5.2_
  - [ ] 11.4 Write property tests for abandonment logic
    - **Property 10: Abandonment Email Idempotency**
    - **Validates: Requirements 5.2, 5.4, 5.5**

- [ ] 12. Implement upsell email scheduling
  - [ ] 12.1 Update `handleOrderPaid` to schedule upsell email
    - Create ScheduledEmails record with scheduledFor = now + 24 hours
    - _Requirements: 6.1_
  - [ ] 12.2 Create `app/api/cron/upsell-emails/route.ts`
    - Query scheduled emails where scheduledFor <= now and status = "pending"
    - Check if customer is unsubscribed, skip if so
    - Send upsell email with related products
    - Update status to "sent"
    - _Requirements: 6.1, 6.3_
  - [ ] 12.3 Add related products logic
    - Query products in same category as purchased items
    - Exclude already purchased products
    - _Requirements: 6.2_
  - [ ] 12.4 Configure Vercel cron for upsells
    - Schedule: every hour
    - _Requirements: 6.1_
  - [ ] 12.5 Write property tests for upsell system
    - **Property 11: Upsell Emails Scheduled**
    - **Property 12: Upsell Emails Respect Unsubscribe**
    - **Validates: Requirements 6.1, 6.3**

- [ ] 13. Final checkpoint - Full system verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all email flows work end-to-end

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Vercel Cron requires a `vercel.json` configuration file
- All marketing emails must include unsubscribe links for compliance
