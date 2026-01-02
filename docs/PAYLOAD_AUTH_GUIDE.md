# Payload CMS Authentication Guide

## Overview

We're using **Payload CMS's built-in authentication** instead of Neon Auth. This simplifies the setup and works perfectly for both authenticated and guest users.

## ✅ Benefits

1. **No extra dependencies** - Payload handles everything
2. **Built-in API endpoints** - `/api/users/login`, `/api/users/logout`, etc.
3. **Session management** - Automatic cookie handling
4. **Guest checkout support** - `orders.user` can be null
5. **Admin panel integration** - Users managed in Payload admin

## 🔧 How It Works

### User Collection

The `Users` collection has `auth: true` which enables:
- Email/password authentication
- JWT token generation
- Session management
- Password hashing (automatic)

### Guest vs Authenticated

- **Authenticated**: `orders.user` = relationship to Users collection
- **Guest**: `orders.user` = null, only email stored
- **Download**: Works for both (email verification for guests)

## 📖 Usage

### Get Current User (Server Component)

```typescript
import { getCurrentUser } from "@/lib/auth/payload";

export default async function Page() {
  const user = await getCurrentUser();
  
  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }
  
  return <div>Guest user</div>;
}
```

### Sign Up

Users can sign up at `/auth/sign-up`. The form:
1. Creates user via `/api/users` POST
2. Auto-logs in via `/api/users/login`
3. Redirects to home page

### Sign In

Users can sign in at `/auth/sign-in`. The form:
1. Authenticates via `/api/users/login`
2. Sets JWT token cookie
3. Redirects to home page

### Sign Out

Users can sign out via `/auth/sign-out` action:
1. Calls `/api/users/logout`
2. Clears token cookie
3. Redirects to sign-in page

### Protected Routes

To protect a route, check for user:

```typescript
import { getCurrentUser } from "@/lib/auth/payload";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/sign-in");
  }
  
  return <div>Protected content</div>;
}
```

## 🔗 Integration with Polar Checkout

When creating a Polar checkout, include the user ID:

```typescript
import { getCurrentUser } from "@/lib/auth/payload";

const user = await getCurrentUser();

const checkout = await createPolarCheckout({
  amount: 4900,
  metadata: {
    user_id: user?.id || null, // null for guests
    product_ids: JSON.stringify([product1Id, product2Id]),
  },
});
```

The webhook will:
1. Extract `user_id` from metadata
2. Store it in `orders.user` (relationship field)
3. Leave null for guest checkout

## 📝 API Endpoints

Payload automatically creates these endpoints:

- `POST /api/users` - Create user (sign up)
- `POST /api/users/login` - Sign in
- `POST /api/users/logout` - Sign out
- `GET /api/users/me` - Get current user
- `PATCH /api/users/:id` - Update user (own data only)

## 🎯 Access Control

The Users collection has access control:
- Users can **read** their own data
- Users can **update** their own data
- Admins can manage all users

## ⚠️ Important Notes

1. **No Neon Auth needed** - Removed all Neon Auth dependencies
2. **Token storage** - JWT tokens stored in HTTP-only cookies
3. **Guest support** - Always allow guest checkout
4. **Admin users** - Created via Payload admin panel
5. **Password reset** - Can be added via Payload hooks if needed

## 🚀 Next Steps

1. **Test sign up**: Visit `/auth/sign-up`
2. **Test sign in**: Visit `/auth/sign-in`
3. **Test guest checkout**: Purchase without signing in
4. **Test authenticated checkout**: Sign in, then purchase
5. **Verify user linking**: Check `orders.user` in admin panel

## 📁 Files

- `lib/auth/payload.ts` - Auth helper functions
- `app/auth/sign-up/` - Sign up page + action
- `app/auth/sign-in/` - Sign in page + action
- `app/auth/sign-out/` - Sign out action
- `collections/Users.ts` - User collection with auth enabled
- `collections/Orders.ts` - Order collection with user relationship

