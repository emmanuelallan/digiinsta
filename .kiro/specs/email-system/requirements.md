# Requirements Document

## Introduction

Complete email system for DigiInsta digital product store. This includes transactional emails triggered by webhooks, scheduled campaign emails, admin notifications via Payload CMS, and a newsletter/broadcast system for marketing campaigns.

## Glossary

- **Resend**: Third-party email delivery service used for sending transactional and marketing emails
- **Payload_CMS**: Content management system with built-in admin panel and email adapter support
- **Polar**: Payment gateway that sends webhook events for order lifecycle
- **Webhook**: HTTP callback triggered by external service events
- **Transactional_Email**: Automated email triggered by user actions (purchase, download, etc.)
- **Broadcast_Email**: Marketing email sent to multiple subscribers (newsletters, announcements)
- **Email_Adapter**: Payload CMS plugin that enables email sending for admin functions

## Requirements

### Requirement 1: Failed Payment Email Handler

**User Story:** As a customer, I want to receive an email when my payment fails, so that I can retry the payment and complete my purchase.

#### Acceptance Criteria

1. WHEN Polar sends a `checkout.failed` or `order.failed` webhook event, THE Webhook_Handler SHALL send a failed payment email to the customer
2. WHEN sending a failed payment email, THE Email_System SHALL include the order reference and a retry URL
3. IF the webhook signature is invalid, THEN THE Webhook_Handler SHALL reject the request with 401 status

### Requirement 2: Payload CMS Email Adapter

**User Story:** As an admin, I want to receive password reset emails and other admin notifications, so that I can manage my account securely.

#### Acceptance Criteria

1. THE Payload_CMS SHALL be configured with a Resend email adapter for admin notifications
2. WHEN an admin requests a password reset, THE Email_Adapter SHALL send a password reset email via Resend
3. WHEN Payload CMS triggers any email notification, THE Email_Adapter SHALL use the configured Resend credentials
4. THE Email_Adapter SHALL use the domain `digiinsta.store` for the from address

### Requirement 3: Newsletter Subscriber Management

**User Story:** As a store owner, I want to collect and manage newsletter subscribers, so that I can send marketing campaigns to interested customers.

#### Acceptance Criteria

1. THE NewsletterSubscribers collection SHALL store subscriber email, status, and subscription date
2. WHEN a user subscribes to the newsletter, THE System SHALL create a subscriber record with status "active"
3. WHEN a user unsubscribes, THE System SHALL update the subscriber status to "unsubscribed"
4. THE System SHALL prevent duplicate email subscriptions
5. WHEN a subscription is created, THE System SHALL send a welcome email to the subscriber

### Requirement 4: Broadcast Email System

**User Story:** As a store owner, I want to send broadcast emails to subscribers, so that I can announce new products and run marketing campaigns.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide an interface to compose and send broadcast emails
2. WHEN sending a broadcast, THE System SHALL only send to subscribers with status "active"
3. THE Broadcast_System SHALL support email templates for new product announcements and upsell campaigns
4. WHEN a broadcast is sent, THE System SHALL log the campaign details (subject, recipient count, sent date)
5. THE Broadcast_System SHALL include an unsubscribe link in all marketing emails

### Requirement 5: Cart Abandonment Recovery

**User Story:** As a store owner, I want to recover abandoned carts by sending reminder emails, so that I can increase conversion rates.

#### Acceptance Criteria

1. THE System SHALL track checkout sessions that are started but not completed
2. WHEN a checkout is abandoned for more than 1 hour, THE System SHALL send a cart abandonment email
3. THE Cart_Abandonment_Email SHALL include the items left in cart and a link to complete checkout
4. THE System SHALL NOT send abandonment emails for checkouts that were completed
5. THE System SHALL limit abandonment emails to one per checkout session

### Requirement 6: Post-Purchase Upsell Emails

**User Story:** As a store owner, I want to send upsell emails after purchases, so that I can increase customer lifetime value.

#### Acceptance Criteria

1. WHEN an order is completed, THE System SHALL schedule an upsell email for 24-48 hours later
2. THE Upsell_Email SHALL recommend related products based on the purchased items
3. THE System SHALL NOT send upsell emails to customers who have unsubscribed
4. THE Upsell_Email SHALL include an unsubscribe link
