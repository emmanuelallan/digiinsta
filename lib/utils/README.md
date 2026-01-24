# Digital Love Storefront Utilities

This directory contains utility functions for the Digital Love Storefront.

## Files

- `validation.ts` - Input validation functions (email, slug)
- `formatting.ts` - Data formatting functions (price)
- `index.ts` - Exports all utility functions

## Usage

```typescript
import { isValidEmail, formatPrice, isValidSlug } from '@/lib/utils';

// Validate email
const valid = isValidEmail('user@example.com'); // true

// Format price
const formatted = formatPrice(19.99); // "$19.99"

// Validate slug
const validSlug = isValidSlug('self-love-journal'); // true
```

## Functions

### `isValidEmail(email: string): boolean`
Validates email format using regex pattern.

### `formatPrice(price: number): string`
Formats a number as USD currency with proper formatting.

### `isValidSlug(slug: string): boolean`
Validates slug format (lowercase letters, numbers, and hyphens only).
