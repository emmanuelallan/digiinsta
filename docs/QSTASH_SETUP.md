# QStash Scheduled Jobs Setup

DigiInsta uses [Upstash QStash](https://upstash.com/qstash) for scheduled background jobs like cart abandonment emails and upsell campaigns.

## Environment Variables

Add these to your `.env.local`:

```bash
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key
```

Get these from your [Upstash Console](https://console.upstash.com/qstash).

## Scheduled Jobs

### 1. Cart Abandonment Emails

Sends reminder emails to customers who started checkout but didn't complete.

- **Endpoint:** `https://digiinsta.store/api/cron/cart-abandonment`
- **Schedule:** Every 2 hours (`0 */2 * * *`)
- **Method:** POST

### 2. Upsell Emails

Sends product recommendations 24-48 hours after purchase.

- **Endpoint:** `https://digiinsta.store/api/cron/send-upsells`
- **Schedule:** Every 6 hours (`0 */6 * * *`)
- **Method:** POST

## Setting Up Schedules in Upstash Console

1. Go to [Upstash Console](https://console.upstash.com/qstash)
2. Click on "Schedules" tab
3. Click "Create Schedule"
4. For each job:
   - **Destination:** Enter the full URL (e.g., `https://digiinsta.store/api/cron/cart-abandonment`)
   - **Schedule:** Enter the cron expression
   - **Method:** POST
   - **Body:** Leave empty (not required)
5. Click "Create"

## Testing Locally

For local development, use [QStash Local Tunnel](https://upstash.com/docs/qstash/howto/local-tunnel):

```bash
npx @upstash/qstash-cli dev
```

Or manually trigger the endpoints:

```bash
# Test cart abandonment
curl -X POST http://localhost:3000/api/cron/cart-abandonment

# Test upsells
curl -X POST http://localhost:3000/api/cron/send-upsells
```

Note: Local testing bypasses signature verification. In production, only QStash can call these endpoints.

## Monitoring

View job execution logs in the Upstash Console under the "Logs" tab.
