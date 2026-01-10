# Design Document: Cache Revalidation Fix

## Overview

This design addresses the content revalidation delays by implementing on-demand revalidation triggered directly from Payload CMS hooks. The current system relies solely on time-based ISR (1 hour for products), causing updates to appear delayed. The new system will trigger immediate revalidation when content changes while maintaining time-based fallback.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAYLOAD CMS                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Products   │  │ Categories  │  │   Bundles   │              │
│  │ Collection  │  │ Collection  │  │ Collection  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │   afterChange Hook    │                          │
│              │   afterDelete Hook    │                          │
│              └───────────┬───────────┘                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
              ┌───────────────────────┐
              │  Revalidation Service │
              │  (lib/revalidation)   │
              │                       │
              │  - computePaths()     │
              │  - computeTags()      │
              │  - triggerRevalidate()│
              └───────────┬───────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │revalidate │  │revalidate │  │revalidate │
    │   Path    │  │   Tag     │  │   Tag     │
    │ /products │  │ product:  │  │ collection│
    │   /slug   │  │   slug    │  │ :homepage │
    └───────────┘  └───────────┘  └───────────┘
```

## Components and Interfaces

### 1. Revalidation Service (`lib/revalidation/index.ts`)

Central service that handles all revalidation logic.

```typescript
interface RevalidationContext {
  collection: "products" | "categories" | "subcategories" | "bundles" | "posts";
  operation: "create" | "update" | "delete";
  doc: {
    id: number;
    slug: string;
    status?: string;
    previousStatus?: string;
    tags?: Array<{ tag: string }>;
    subcategory?: { id: number; slug: string; category?: { id: number; slug: string } };
    category?: { id: number; slug: string };
  };
}

interface RevalidationResult {
  success: boolean;
  paths: string[];
  tags: string[];
  errors?: string[];
}

// Main functions
function computePathsToRevalidate(context: RevalidationContext): string[];
function computeTagsToInvalidate(context: RevalidationContext): string[];
async function triggerRevalidation(context: RevalidationContext): Promise<RevalidationResult>;
```

### 2. Payload Hooks (`lib/revalidation/hooks.ts`)

Hooks to be added to Payload collections.

```typescript
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';

const createRevalidationAfterChangeHook = (
  collection: RevalidationContext['collection']
): CollectionAfterChangeHook;

const createRevalidationAfterDeleteHook = (
  collection: RevalidationContext['collection']
): CollectionAfterDeleteHook;
```

### 3. Cache Tags Configuration (`lib/revalidation/tags.ts`)

Defines the tagging strategy for different content types.

```typescript
// Tag prefixes
const TAG_PREFIXES = {
  product: "product",
  category: "category",
  subcategory: "subcategory",
  bundle: "bundle",
  post: "post",
  collection: "collection",
} as const;

// Collection tags for listing pages
const COLLECTION_TAGS = {
  homepage: "collection:homepage",
  bestSellers: "collection:best-sellers",
  newArrivals: "collection:new-arrivals",
  editorsPicks: "collection:editors-picks",
  allProducts: "collection:all-products",
} as const;
```

## Data Models

### RevalidationContext

The context object passed to revalidation functions contains all information needed to determine what to revalidate:

| Field              | Type   | Description                                   |
| ------------------ | ------ | --------------------------------------------- |
| collection         | string | The Payload collection being modified         |
| operation          | string | 'create', 'update', or 'delete'               |
| doc.id             | number | Document ID                                   |
| doc.slug           | string | URL slug                                      |
| doc.status         | string | Current status (active/draft/archived)        |
| doc.previousStatus | string | Previous status (for status change detection) |
| doc.tags           | array  | Product tags (for collection page targeting)  |
| doc.subcategory    | object | Related subcategory with category             |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Path Computation Correctness

_For any_ content change (product, category, subcategory, bundle, or post), the computed revalidation paths SHALL include the direct page path and all parent listing pages that display that content.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Tag Generation Correctness

_For any_ content item, the generated cache tags SHALL include the item's own identifier tag and all ancestor tags (subcategory tag for products, category tag for subcategories).

**Validates: Requirements 2.1, 2.2**

### Property 3: Tag Invalidation Scope

_For any_ content update, the invalidated tags SHALL be a subset of all tags in the system, containing only tags directly related to the updated content and its dependents.

**Validates: Requirements 2.4, 2.5**

### Property 4: Collection Page Revalidation

_For any_ product with special tags (best-seller, new-arrival, featured), updating that product SHALL include the corresponding collection page tags in the invalidation set.

**Validates: Requirements 5.1, 5.2**

### Property 5: Creation Triggers New Arrivals

_For any_ newly created product, the revalidation SHALL always include the new arrivals collection tag regardless of the product's tags.

**Validates: Requirements 5.3**

### Property 6: Status Change Triggers Listing Updates

_For any_ product status change (to active or archived), the revalidation SHALL include all listing page tags that could display that product.

**Validates: Requirements 5.4**

### Property 7: Retry on Failure

_For any_ revalidation operation that fails on first attempt, the system SHALL retry exactly once before reporting failure, and the failure SHALL NOT block the CMS save operation.

**Validates: Requirements 1.5**

## Error Handling

### Revalidation Failures

1. **First attempt fails**: Retry once with exponential backoff (100ms delay)
2. **Retry fails**: Log error with full context, return failure result
3. **Never block**: CMS save operation completes regardless of revalidation status

### Logging Strategy

```typescript
// Success log
logger.info("Revalidation triggered", {
  collection,
  operation,
  slug: doc.slug,
  paths,
  tags,
  duration: endTime - startTime,
});

// Failure log
logger.error("Revalidation failed", {
  collection,
  operation,
  slug: doc.slug,
  error: error.message,
  attempt: attemptNumber,
});
```

### Edge Cases

| Scenario                        | Handling                                              |
| ------------------------------- | ----------------------------------------------------- |
| Product with no subcategory     | Skip subcategory/category path revalidation           |
| Deleted product                 | Revalidate listing pages only (product page will 404) |
| Draft → Active status change    | Treat as creation for revalidation purposes           |
| Active → Archived status change | Revalidate all listing pages that showed the product  |

## Testing Strategy

### Unit Tests

- Test `computePathsToRevalidate` with various document structures
- Test `computeTagsToInvalidate` with different collection types
- Test retry logic with mocked failures
- Test edge cases (missing relationships, empty tags)

### Property-Based Tests

Using a property-based testing library (e.g., fast-check), we will verify:

1. **Path computation** always includes the direct page path
2. **Tag generation** always includes the item's own tag
3. **Tag invalidation** never includes unrelated content tags
4. **Collection targeting** correctly identifies special tags

### Integration Tests

- Verify hooks are called when documents are saved in Payload
- Verify `revalidatePath` and `revalidateTag` are called with correct arguments
- Verify admin notification appears after save

### Test Configuration

- Minimum 100 iterations per property test
- Each property test tagged with: **Feature: cache-revalidation-fix, Property N: [description]**
