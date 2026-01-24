# Digital Love Storefront Types

This directory contains TypeScript type definitions for the Digital Love Storefront.

## Files

- `storefront.ts` - Core data models for products, collections, badges, taxonomies, FAQs, steps, and email subscriptions
- `index.ts` - Exports all types for easy importing

## Usage

```typescript
import { Product, Collection, Badge } from '@/lib/types';
```

## Type Definitions

- **Product**: Complete product information including images, badges, taxonomies, and content
- **ProductImage**: Product image with type classification (lifestyle, overview, sample, etc.)
- **Badge**: Product badge with type (bestseller, valentine, editable, instant, new)
- **Taxonomy**: Product classification (relationship, occasion, format)
- **Collection**: Product collection with filtering criteria
- **Step**: Numbered step with title and description (used in "How to Use")
- **FAQ**: Question and answer pair with ordering
- **EmailSubscription**: Email subscription record with source tracking
- **CTAButton**: Call-to-action button configuration
