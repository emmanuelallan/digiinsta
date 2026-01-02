# Neon Auth Integration Guide

## Overview

Neon Auth provides managed authentication for your Neon Postgres database. It handles:
- User signup/login
- Session management
- OAuth providers (Google, GitHub, etc.)
- Magic links
- User records stored directly in Neon

## Setup Steps

### 1. Enable Neon Auth in Neon Dashboard

1. Go to your Neon project dashboard
2. Navigate to **Auth** section
3. Enable Neon Auth
4. Copy your `NEON_AUTH_SECRET` (this is different from your database password)

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Neon Auth
NEON_AUTH_SECRET=your_auth_secret_from_neon_dashboard
NEXT_PUBLIC_NEON_DATABASE_URL=your_public_database_url
NEXT_PUBLIC_NEON_AUTH_SECRET=your_auth_secret_for_client
```

**Note**: For client-side auth, you may need a separate public key. Check Neon Auth documentation for the exact setup.

### 3. Database Schema

Neon Auth automatically creates a `users` table in your database. You don't need to create it manually.

### 4. Usage

#### Server-Side (Server Components, Server Actions)

```typescript
import { getCurrentUser } from "@/lib/auth/neon";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Guest user
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user.email}</div>;
}
```

#### Client-Side (Client Components)

```typescript
"use client";
import { neonAuthClient } from "@/lib/auth/client";

export function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    const result = await neonAuthClient.signIn(email, password);
    if (result.user) {
      // User logged in
      window.location.href = "/dashboard";
    }
  };
  
  // ... form implementation
}
```

### 5. Guest Checkout Support

The system supports both authenticated and guest checkout:

- **Authenticated**: User ID is stored in `orders.userId`
- **Guest**: Only email is stored, `orders.userId` is null

When creating a Polar checkout, include the user ID in metadata:

```typescript
const checkout = await createPolarCheckout({
  amount: 4900, // $49.00
  metadata: {
    user_id: user?.id || null, // null for guests
    product_ids: JSON.stringify([product1Id, product2Id]),
  },
});
```

### 6. Revenue Attribution

Orders track `ownerAttribution` which determines who gets credit for the sale:
- Calculated automatically based on products purchased
- If all products belong to one owner → that owner gets credit
- If mixed → owner with more products gets credit

Use `getRevenueByOwner()` to calculate revenue stats for the $400/month goal.

## Important Notes

1. **Neon Auth is in Beta**: The API may change. Check [Neon Auth docs](https://neon.com/docs/auth) for latest updates.

2. **Session Management**: Sessions are stored in HTTP-only cookies for security.

3. **Guest Users**: Always support guest checkout - don't force authentication.

4. **User ID in Orders**: Always include `user_id` in Polar checkout metadata for proper attribution.

## Troubleshooting

- **"NEON_AUTH_SECRET not configured"**: Make sure you've enabled Neon Auth in dashboard and copied the secret
- **"User not found"**: User might not exist yet - handle signup flow
- **Session issues**: Clear cookies and try again

