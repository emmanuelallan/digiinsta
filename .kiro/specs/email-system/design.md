# Design Document: Email System

## Overview

This design implements a complete email system for DigiInsta, covering transactional emails (webhook-triggered), admin notifications (Payload CMS adapter), newsletter management, broadcast campaigns, cart abandonment recovery, and post-purchase upsells.

The system leverages Resend as the email delivery provider, integrates with Polar webhooks for payment events, and uses Vercel Cron for scheduled jobs.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Email System                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Webhooks   │    │  Scheduled   │    │   Admin      │       │
│  │   (Polar)    │    │    Jobs      │    │  (Payload)   │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              Email Service (lib/email.ts)            │        │
│  │  - sendEmail()                                       │        │
│  │  - sendBroadcast()                                   │        │
│  │  - emailTemplates                                    │        │
│  └─────────────────────────┬───────────────────────────┘        │
│                            │                                     │
│                            ▼                                     │
│                    ┌──────────────┐                              │
│                    │    Resend    │                              │
│                    │     API      │                              │
│                    └──────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Webhook Handler Extensions

Extend `app/api/webhooks/polar/route.ts` to handle failed payment events:

```typescript
// New webhook event handlers
async function handleCheckoutFailed(data: Record<string, unknown>): Promise<void>;
async function handleOrderFailed(data: Record<string, unknown>): Promise<void>;
```

### 2. Payload CMS Email Adapter

Configure Payload with Resend adapter in `payload.config.ts`:

```typescript
import { resendAdapter } from "@payloadcms/email-resend";

// In buildConfig
email: resendAdapter({
  defaultFromAddress: "noreply@digiinsta.store",
  defaultFromName: "DigiInsta",
  apiKey: process.env.RESEND_API_KEY,
});
```

### 3. Newsletter Subscription API

New API route `app/api/newsletter/route.ts`:

```typescript
// POST - Subscribe to newsletter
interface SubscribeRequest {
  email: string;
}

// DELETE - Unsubscribe from newsletter
interface UnsubscribeRequest {
  email: string;
  token: string; // Verification token
}
```

### 4. Broadcast Email System

New admin component and API:

```typescript
// app/api/admin/broadcast/route.ts
interface BroadcastRequest {
  subject: string;
  template: "newProduct" | "upsell" | "custom";
  templateData?: Record<string, unknown>;
  customHtml?: string;
}

// lib/email.ts additions
async function sendBroadcast(options: BroadcastOptions): Promise<BroadcastResult>;
```

### 5. Scheduled Jobs (Vercel Cron)

```typescript
// app/api/cron/cart-abandonment/route.ts
// Runs every hour, sends emails for abandoned checkouts > 1 hour old

// app/api/cron/upsell-emails/route.ts
// Runs every hour, sends upsell emails for orders 24-48 hours old
```

## Data Models

### AbandonedCheckouts Collection

New Payload collection to track checkout sessions:

```typescript
{
  slug: 'abandoned-checkouts',
  fields: [
    { name: 'polarCheckoutId', type: 'text', required: true, unique: true },
    { name: 'email', type: 'email', required: true },
    { name: 'items', type: 'json' }, // Cart items
    { name: 'checkoutUrl', type: 'text' },
    { name: 'status', type: 'select', options: ['pending', 'completed', 'abandoned', 'email_sent'] },
    { name: 'createdAt', type: 'date' },
    { name: 'emailSentAt', type: 'date' },
  ]
}
```

### ScheduledEmails Collection

Track scheduled emails (upsells):

```typescript
{
  slug: 'scheduled-emails',
  fields: [
    { name: 'orderId', type: 'relationship', relationTo: 'orders' },
    { name: 'email', type: 'email', required: true },
    { name: 'type', type: 'select', options: ['upsell', 'followup'] },
    { name: 'scheduledFor', type: 'date', required: true },
    { name: 'status', type: 'select', options: ['pending', 'sent', 'cancelled'] },
    { name: 'sentAt', type: 'date' },
  ]
}
```

### EmailCampaigns Collection

Log broadcast campaigns:

```typescript
{
  slug: 'email-campaigns',
  fields: [
    { name: 'subject', type: 'text', required: true },
    { name: 'template', type: 'text' },
    { name: 'recipientCount', type: 'number' },
    { name: 'sentAt', type: 'date' },
    { name: 'sentBy', type: 'relationship', relationTo: 'users' },
  ]
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Invalid Webhook Signatures Rejected

_For any_ webhook request with an invalid or missing signature, the handler SHALL return a 401 status and NOT process the event.

**Validates: Requirements 1.3**

### Property 2: Failed Payment Emails Sent

_For any_ valid `checkout.failed` or `order.failed` webhook event, the system SHALL send exactly one failed payment email to the customer email address.

**Validates: Requirements 1.1**

### Property 3: Email Templates Contain Required Fields

_For any_ email template output:

- Failed payment emails SHALL contain order reference and retry URL
- Cart abandonment emails SHALL contain cart items and checkout link
- Upsell emails SHALL contain related products and unsubscribe link
- All marketing emails SHALL contain an unsubscribe link

**Validates: Requirements 1.2, 4.5, 5.3, 6.2, 6.4**

### Property 4: Subscription State Transitions

_For any_ email address:

- Subscribing SHALL result in status "active"
- Unsubscribing SHALL result in status "unsubscribed"
- State transitions SHALL be idempotent (subscribing twice = one active record)

**Validates: Requirements 3.2, 3.3**

### Property 5: Duplicate Subscriptions Prevented

_For any_ email address that is already subscribed, attempting to subscribe again SHALL NOT create a duplicate record.

**Validates: Requirements 3.4**

### Property 6: Welcome Emails on Subscription

_For any_ new newsletter subscription, the system SHALL send exactly one welcome email to the subscriber.

**Validates: Requirements 3.5**

### Property 7: Broadcasts Only Reach Active Subscribers

_For any_ broadcast email campaign, the system SHALL only send to subscribers with status "active" and SHALL NOT send to unsubscribed users.

**Validates: Requirements 4.2**

### Property 8: Broadcast Campaigns Logged

_For any_ broadcast email sent, the system SHALL create a campaign log entry with subject, recipient count, and sent date.

**Validates: Requirements 4.4**

### Property 9: Checkout Sessions Tracked

_For any_ `checkout.updated` webhook event, the system SHALL create or update an abandoned checkout record.

**Validates: Requirements 5.1**

### Property 10: Abandonment Email Idempotency

_For any_ abandoned checkout:

- If completed, no abandonment email SHALL be sent
- If already sent an email, no additional email SHALL be sent
- Only checkouts abandoned > 1 hour SHALL receive emails

**Validates: Requirements 5.2, 5.4, 5.5**

### Property 11: Upsell Emails Scheduled

_For any_ completed order, the system SHALL schedule exactly one upsell email for 24-48 hours after completion.

**Validates: Requirements 6.1**

### Property 12: Upsell Emails Respect Unsubscribe

_For any_ scheduled upsell email, if the customer has unsubscribed, the email SHALL NOT be sent.

**Validates: Requirements 6.3**

## Error Handling

### Webhook Errors

- Invalid signature: Return 401, log error
- Missing data: Return 400, log error
- Processing error: Return 500, allow Polar to retry

### Email Sending Errors

- Resend API failure: Log error, don't throw (non-blocking)
- Invalid email: Skip and log
- Rate limiting: Implement exponential backoff for broadcasts

### Cron Job Errors

- Database query failure: Log and exit gracefully
- Partial send failure: Continue with remaining emails, log failures

## Testing Strategy

### Unit Tests

- Email template output validation
- Webhook signature verification
- Subscription state machine logic
- Cron job query logic

### Property-Based Tests

- Use fast-check for TypeScript property testing
- Minimum 100 iterations per property
- Test email template invariants
- Test subscription state transitions
- Test broadcast recipient filtering

### Integration Tests

- Webhook handler with mock Polar events
- Newsletter subscription flow
- Broadcast sending with test subscribers
