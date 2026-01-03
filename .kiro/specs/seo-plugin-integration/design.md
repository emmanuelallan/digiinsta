# Design Document: SEO Plugin Integration

## Overview

This design integrates the `@payloadcms/plugin-seo` plugin into the DigiInsta platform, replacing manual SEO fields with a standardized, feature-rich solution. The plugin provides auto-generation capabilities, real-time search preview, and character indicators to help content editors create effective metadata.

## Architecture

The integration follows a plugin-based architecture where the SEO plugin hooks into Payload's collection system:

```
┌─────────────────────────────────────────────────────────┐
│                    Payload Config                        │
├─────────────────────────────────────────────────────────┤
│  plugins: [                                              │
│    s3Storage(...),                                       │
│    seoPlugin({                                           │
│      collections: ['products', 'posts', 'bundles'],      │
│      uploadsCollection: 'media',                         │
│      generateTitle, generateDescription,                 │
│      generateImage, generateURL                          │
│    })                                                    │
│  ]                                                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SEO-Enabled Collections                     │
├─────────────────────────────────────────────────────────┤
│  Products    │    Posts    │    Bundles                  │
│  ─────────   │   ─────────  │   ─────────                │
│  + meta {    │   + meta {   │   + meta {                 │
│      title   │       title  │       title                │
│      desc    │       desc   │       desc                 │
│      image   │       image  │       image                │
│    }         │     }        │     }                      │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Plugin Configuration

The SEO plugin is configured in `payload.config.ts` with the following structure:

```typescript
import { seoPlugin } from "@payloadcms/plugin-seo";
import type {
  GenerateTitle,
  GenerateDescription,
  GenerateImage,
  GenerateURL,
} from "@payloadcms/plugin-seo/types";

// Type-safe generation functions
const generateTitle: GenerateTitle = ({ doc }) => {
  return `DigiInsta — ${doc?.title || "Untitled"}`;
};

const generateDescription: GenerateDescription = ({ doc }) => {
  // Use shortDescription for products/bundles, excerpt for posts
  return doc?.shortDescription || doc?.excerpt || "";
};

const generateImage: GenerateImage = ({ doc }) => {
  // Use featuredImage for posts, heroImage for bundles, first image for products
  if (doc?.featuredImage) return doc.featuredImage;
  if (doc?.heroImage) return doc.heroImage;
  if (doc?.images?.[0]?.image) return doc.images[0].image;
  return undefined;
};

const generateURL: GenerateURL = ({ doc, collectionSlug }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://digiinsta.store";
  const slug = doc?.slug || "";

  const pathMap: Record<string, string> = {
    products: "products",
    posts: "blog",
    bundles: "bundles",
  };

  const path = pathMap[collectionSlug] || collectionSlug;
  return `${baseUrl}/${path}/${slug}`;
};

// Plugin configuration
seoPlugin({
  collections: ["products", "posts", "bundles"],
  uploadsCollection: "media",
  tabbedUI: true,
  generateTitle,
  generateDescription,
  generateImage,
  generateURL,
});
```

### Collection Field Changes

Each SEO-enabled collection will have the following changes:

**Removed Fields:**

- `metaTitle` (text)
- `metaDescription` (textarea)
- `ogImage` (upload)

**Added by Plugin:**

- `meta` (group)
  - `meta.title` (text with character counter)
  - `meta.description` (textarea with character counter)
  - `meta.image` (upload relationship to media)

### Admin Panel UI

The plugin adds a dedicated "SEO" tab to each collection's edit view:

```
┌─────────────────────────────────────────────────────────┐
│  [Content]  [SEO]                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Meta Title                          [Auto-generate]     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DigiInsta — Premium UI Kit                       │    │
│  └─────────────────────────────────────────────────┘    │
│  45/60 characters                                        │
│                                                          │
│  Meta Description                    [Auto-generate]     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ A comprehensive UI kit with 200+ components...   │    │
│  └─────────────────────────────────────────────────┘    │
│  120/160 characters                                      │
│                                                          │
│  Meta Image                          [Auto-generate]     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [Image Preview]                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  Search Preview                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ DigiInsta — Premium UI Kit                       │    │
│  │ https://digiinsta.store/products/premium-ui-kit    │    │
│  │ A comprehensive UI kit with 200+ components...   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Data Models

### Meta Field Structure

The plugin adds a `meta` field group with the following structure:

```typescript
interface Meta {
  title?: string | null;
  description?: string | null;
  image?: string | Media | null; // Relationship to media collection
}
```

### Generated Types

After running `payload generate:types`, the collections will include:

```typescript
// In payload-types.ts
export interface Product {
  id: string;
  title: string;
  slug: string;
  // ... other fields
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: string | Media | null;
  };
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Title Generation Format

_For any_ document with a title field, when auto-generate is triggered for the meta title, the result SHALL follow the format "DigiInsta — {document.title}".

**Validates: Requirements 3.1**

### Property 2: Description Source Selection

_For any_ document, when auto-generate is triggered for description, the result SHALL be the document's shortDescription (for products/bundles) or excerpt (for posts), or empty string if neither exists.

**Validates: Requirements 3.2, 3.4**

### Property 3: Image Source Selection

_For any_ document, when auto-generate is triggered for image, the result SHALL be the first available image from: featuredImage, heroImage, or images[0].image, in that order.

**Validates: Requirements 3.3, 3.4**

### Property 4: URL Generation by Collection

_For any_ document with a slug, the generated preview URL SHALL match the pattern "{baseUrl}/{collectionPath}/{slug}" where collectionPath is "products", "blog", or "bundles" based on the collection slug.

**Validates: Requirements 4.2, 4.3, 4.4**

### Property 5: Legacy Field Removal

_For any_ SEO-enabled collection, the fields metaTitle, metaDescription, and ogImage SHALL NOT exist in the collection configuration.

**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

| Scenario                           | Handling                                      |
| ---------------------------------- | --------------------------------------------- |
| Document has no title              | Generate title returns "DigiInsta — Untitled" |
| Document has no description source | Generate description returns empty string     |
| Document has no images             | Generate image returns undefined              |
| Document has no slug               | Generate URL uses empty string for slug       |
| Media collection unavailable       | Plugin falls back to no image field           |

## Testing Strategy

### Unit Tests

Unit tests will verify the generation functions work correctly:

1. **Title Generation Tests**
   - Test with various document titles
   - Test with missing title field
   - Test with empty title

2. **Description Generation Tests**
   - Test with shortDescription present
   - Test with excerpt present
   - Test with neither present
   - Test priority (shortDescription over excerpt)

3. **Image Generation Tests**
   - Test with featuredImage
   - Test with heroImage
   - Test with images array
   - Test priority order

4. **URL Generation Tests**
   - Test each collection type
   - Test with various slugs
   - Test with missing slug

### Property-Based Tests

Property-based tests will verify the generation functions maintain their contracts across many inputs:

- **Property 1**: Title format consistency
- **Property 2**: Description source selection
- **Property 3**: Image source priority
- **Property 4**: URL pattern matching

### Integration Tests

Integration tests will verify the plugin works correctly within Payload:

1. Verify meta fields appear on collections
2. Verify auto-generate buttons function
3. Verify search preview renders
4. Verify types are generated correctly
