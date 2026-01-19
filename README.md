# DigiInsta Store - Complete Development Blueprint

## 📋 Project Overview

**Name:** DigiInsta Store  
**Domain:** digiinsta.store  
**Type:** Single-vendor digital products storefront  
**Timeline:** 3-4 weeks  
**Tech Stack:** Next.js 15+, Neon (PostgreSQL), Drizzle ORM, Cloudflare R2, Lemon Squeezy

---

## 🎯 Key Architectural Decisions

**Critical Rules (Non-Negotiable):**

1. **Product Lifecycle**: Products start as draft (`isActive: false`) and only become active when successfully synced to Lemon Squeezy. Failed syncs keep products inactive.

2. **File Delivery**: Lemon Squeezy handles all product file delivery automatically. Display images stored in R2, product files uploaded to Lemon Squeezy.

3. **Cart Validation**: `lsVariantId` is required in cart items. Products must be synced before they can be added to cart.

4. **Order Items**: Exactly one of `productId` or `bundleId` must be set (enforced at application level).

5. **Soft Delete**: Products use `deletedAt` timestamp for soft deletion. Always filter `deletedAt IS NULL` in queries.

6. **Storefront Queries**: Always filter `isActive = true` AND `syncStatus = 'synced'` AND `deletedAt IS NULL`.

7. **Bundle Pricing**: Auto-calculated from included products (20% discount default), with manual override option.

8. **SEO Fields**: Auto-generated from product name/description if not provided.

9. **Form UX**: Single-page product form with progressive disclosure, auto-save every 30 seconds, real-time validation.

10. **Success Page**: Links to Lemon Squeezy customer portal - no custom download page needed.

---

## 🏗️ Tech Stack (Final)

```yaml
Framework: Next.js 15+ (App Router)
Database: Neon (PostgreSQL) - Hobby tier (free)
ORM: Drizzle ORM
Storage: Cloudflare R2 (free tier)
Auth: Manual (email magic link)
Payments: Lemon Squeezy
Email: Resend (free tier)
Analytics: Umami (self-hosted or free tier)

UI/Components:
  - shadcn/ui (base components)
  - Tiptap (rich text editor)
  - Embla Carousel (via shadcn)
  - Lucide Icons

State Management:
  - Zustand (cart + admin UI state only)
  - Server Components (everything else)

Utilities:
  - es-toolkit (lodash alternative)
  - zod (validation)
  - date-fns (date manipulation)
  - react-hook-form (forms)

Deployment:
  - Vercel (Hobby - free)
  - GitHub (version control)
```

---

## 📁 Project Structure

```
digiinsta-store/
├── .env.local
├── .env.example
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── src/
│   ├── app/
│   │   ├── (storefront)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                # All products
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx            # Product detail
│   │   │   │       └── loading.tsx
│   │   │   ├── categories/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx            # Category page with filters
│   │   │   │       └── loading.tsx
│   │   │   ├── bundles/
│   │   │   │   ├── page.tsx                # All bundles
│   │   │   │   └── [slug]/page.tsx         # Bundle detail
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx
│   │   │   │   └── success/page.tsx
│   │   │   └── legal/
│   │   │       ├── privacy/page.tsx
│   │   │       ├── terms/page.tsx
│   │   │       └── refund/page.tsx
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── verify/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx              # Protected layout
│   │   │       ├── page.tsx                # Stats overview
│   │   │       ├── products/
│   │   │       │   ├── page.tsx            # Products list
│   │   │       │   ├── new/page.tsx        # Create product
│   │   │       │   └── [id]/edit/page.tsx  # Edit product
│   │   │       ├── bundles/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       ├── categories/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/edit/page.tsx
│   │   │       ├── taxonomy/
│   │   │       │   ├── product-types/page.tsx
│   │   │       │   ├── formats/page.tsx
│   │   │       │   ├── audiences/page.tsx
│   │   │       │   └── use-cases/page.tsx
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       ├── promos/page.tsx         # Banner management
│   │   │       └── settings/page.tsx
│   │   │
│   │   └── api/
│   │       ├── webhooks/
│   │       │   └── lemon-squeezy/route.ts
│   │       ├── checkout/
│   │       │   └── create/route.ts
│   │       ├── upload/
│   │       │   └── route.ts
│   │       └── auth/
│   │           ├── send-code/route.ts
│   │           ├── verify-code/route.ts
│   │           └── logout/route.ts
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn components
│   │   ├── storefront/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── mega-menu.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── product-filters.tsx
│   │   │   ├── product-gallery.tsx
│   │   │   ├── cart-drawer.tsx
│   │   │   ├── promo-banner.tsx
│   │   │   ├── recommendations.tsx
│   │   │   └── mobile-menu.tsx
│   │   ├── admin/
│   │   │   ├── sidebar.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── bundle-form.tsx
│   │   │   ├── category-form.tsx
│   │   │   ├── image-upload.tsx
│   │   │   ├── rich-text-editor.tsx
│   │   │   ├── whats-inside-editor.tsx
│   │   │   └── data-table.tsx
│   │   └── shared/
│   │       ├── image.tsx
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                    # Drizzle client
│   │   │   ├── schema.ts                   # All tables
│   │   │   ├── migrations/
│   │   │   └── seed.ts                     # Initial data
│   │   ├── auth/
│   │   │   ├── index.ts                    # Auth helpers
│   │   │   ├── middleware.ts               # Protection
│   │   │   └── session.ts
│   │   ├── storage/
│   │   │   ├── r2.ts                       # R2 client
│   │   │   └── upload.ts                   # Upload helpers
│   │   ├── email/
│   │   │   ├── resend.ts                   # Client
│   │   │   └── templates/
│   │   │       ├── magic-link.tsx
│   │   │       ├── order-confirmation.tsx
│   │   │       └── download-link.tsx
│   │   ├── payments/
│   │   │   ├── lemon-squeezy.ts            # Lemon Squeezy client
│   │   │   └── webhooks.ts                 # Webhook verification
│   │   ├── analytics/
│   │   │   └── umami.ts
│   │   ├── utils/
│   │   │   ├── seo.ts                      # Meta generation
│   │   │   ├── slugify.ts
│   │   │   ├── currency.ts
│   │   │   └── date.ts
│   │   └── validations/
│   │       ├── product.ts
│   │       ├── category.ts
│   │       └── auth.ts
│   │
│   ├── store/
│   │   ├── cart.ts                         # Zustand cart store
│   │   └── admin-ui.ts                     # Zustand admin UI state
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   └── admin.ts
│   │
│   └── proxy.ts                            # Route protection (Next.js 16)
│
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── placeholder.png
│
└── drizzle/
    └── migrations/
```

---

## 🗄️ Database Schema (Drizzle)

```typescript
// src/lib/db/schema.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== TAXONOMY TABLES ====================

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),

    // SEO
    seoTitle: varchar("seo_title", { length: 150 }),
    seoDescription: varchar("seo_description", { length: 300 }),
    seoKeywords: text("seo_keywords"),

    // Display
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug),
    activeIdx: index("categories_active_idx").on(table.isActive),
  })
);

export const productTypes = pgTable("product_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const formats = pgTable("formats", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const audiences = pgTable("audiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const useCases = pgTable("use_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== PRODUCTS ====================

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),

    // Pricing
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }), // For "on sale"

    // Content
    shortDescription: varchar("short_description", { length: 300 }),
    description: text("description").notNull(), // Rich text HTML

    // Category
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),

    // Metadata
    videoUrl: varchar("video_url", { length: 500 }), // "A Closer Look" YouTube

    // Lemon Squeezy integration (auto-synced)
    lsProductId: varchar("ls_product_id", { length: 100 }),
    lsVariantId: varchar("ls_variant_id", { length: 100 }),
    syncStatus: varchar("sync_status", { length: 20 }).default("pending"), // pending, synced, failed
    syncError: text("sync_error"),
    lastSyncedAt: timestamp("last_synced_at"),

    // Flags
    isFeatured: boolean("is_featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false), // Draft by default, only active when synced
    deletedAt: timestamp("deleted_at"), // Soft delete

    // Stats
    viewsCount: integer("views_count").notNull().default(0),
    salesCount: integer("sales_count").notNull().default(0),

    // SEO (auto-generated if not provided)
    seoTitle: varchar("seo_title", { length: 150 }), // Auto: product name if empty
    seoDescription: varchar("seo_description", { length: 300 }), // Auto: shortDescription if empty

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index("products_slug_idx").on(table.slug),
    categoryIdx: index("products_category_idx").on(table.categoryId),
    featuredIdx: index("products_featured_idx").on(table.isFeatured),
    newIdx: index("products_new_idx").on(table.isNew),
    activeIdx: index("products_active_idx").on(table.isActive),
  })
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 500 }).notNull(),
    altText: varchar("alt_text", { length: 200 }),
    displayOrder: integer("display_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_images_product_idx").on(table.productId),
  })
);

export const whatsInsideItems = pgTable(
  "whats_inside_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 150 }).notNull(),
    imageUrl: varchar("image_url", { length: 500 }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("whats_inside_product_idx").on(table.productId),
  })
);

// ==================== PRODUCT RELATIONSHIPS (Many-to-Many) ====================

export const productToProductTypes = pgTable(
  "product_to_product_types",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    productTypeId: uuid("product_type_id")
      .notNull()
      .references(() => productTypes.id, { onDelete: "cascade" }),
  },
  (table) => ({
    productIdx: index("product_types_product_idx").on(table.productId),
  })
);

export const productToFormats = pgTable(
  "product_to_formats",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    formatId: uuid("format_id")
      .notNull()
      .references(() => formats.id, { onDelete: "cascade" }),
  },
  (table) => ({
    productIdx: index("formats_product_idx").on(table.productId),
  })
);

export const productToAudiences = pgTable(
  "product_to_audiences",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    audienceId: uuid("audience_id")
      .notNull()
      .references(() => audiences.id, { onDelete: "cascade" }),
  },
  (table) => ({
    productIdx: index("audiences_product_idx").on(table.productId),
  })
);

export const productToUseCases = pgTable(
  "product_to_use_cases",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    useCaseId: uuid("use_case_id")
      .notNull()
      .references(() => useCases.id, { onDelete: "cascade" }),
  },
  (table) => ({
    productIdx: index("use_cases_product_idx").on(table.productId),
  })
);

// ==================== BUNDLES ====================

export const bundles = pgTable(
  "bundles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),

    // Pricing
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Auto-calculated from products, can override
    priceOverride: decimal("price_override", { precision: 10, scale: 2 }), // Manual override if needed
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),

    // Content
    shortDescription: varchar("short_description", { length: 300 }),
    description: text("description").notNull(),

    // Metadata
    imageUrl: varchar("image_url", { length: 500 }),

    // Lemon Squeezy integration (auto-synced)
    lsProductId: varchar("ls_product_id", { length: 100 }),
    lsVariantId: varchar("ls_variant_id", { length: 100 }),
    syncStatus: varchar("sync_status", { length: 20 }).default("pending"),
    syncError: text("sync_error"),
    lastSyncedAt: timestamp("last_synced_at"),

    // Flags
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false), // Draft by default, only active when synced
    deletedAt: timestamp("deleted_at"), // Soft delete

    // Stats
    viewsCount: integer("views_count").notNull().default(0),
    salesCount: integer("sales_count").notNull().default(0),

    // SEO
    seoTitle: varchar("seo_title", { length: 150 }),
    seoDescription: varchar("seo_description", { length: 300 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: index("bundles_slug_idx").on(table.slug),
  })
);

export const bundleProducts = pgTable(
  "bundle_products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bundleId: uuid("bundle_id")
      .notNull()
      .references(() => bundles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bundleIdx: index("bundle_products_bundle_idx").on(table.bundleId),
  })
);

// ==================== ORDERS ====================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Lemon Squeezy reference
    lsOrderId: varchar("ls_order_id", { length: 100 }).unique(),

    // Customer (from Lemon Squeezy webhook)
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 200 }),

    // Pricing
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),

    // Status
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, paid, failed, refunded
    fulfillmentStatus: varchar("fulfillment_status", { length: 20 })
      .notNull()
      .default("pending"), // pending, fulfilled, failed

    // Metadata
    metadata: jsonb("metadata"), // Store Lemon Squeezy webhook data

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("orders_email_idx").on(table.customerEmail),
    statusIdx: index("orders_status_idx").on(table.status),
    lsOrderIdx: index("orders_ls_order_idx").on(table.lsOrderId),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    // Exactly ONE must be set (product OR bundle) - enforced at application level
    productId: uuid("product_id").references(() => products.id),
    bundleId: uuid("bundle_id").references(() => bundles.id),

    // Pricing
    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

    // Snapshot (preserve product details at time of purchase)
    productSnapshot: jsonb("product_snapshot").notNull(), // { name, formats, etc. }

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    orderIdx: index("order_items_order_idx").on(table.orderId),
  })
);

// ==================== PROMO BANNERS ====================

export const promoBanners = pgTable("promo_banners", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: varchar("text", { length: 200 }).notNull(),
  linkUrl: varchar("link_url", { length: 500 }),
  backgroundColor: varchar("background_color", { length: 7 }).default(
    "#000000"
  ),
  textColor: varchar("text_color", { length: 7 }).default("#FFFFFF"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== AUTH ====================

export const loginCodes = pgTable(
  "login_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    emailCodeIdx: index("login_codes_email_code_idx").on(
      table.email,
      table.code
    ),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminEmail: varchar("admin_email", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("sessions_email_idx").on(table.adminEmail),
  })
);

// ==================== RELATIONS ====================

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  whatsInsideItems: many(whatsInsideItems),
  productTypes: many(productToProductTypes),
  formats: many(productToFormats),
  audiences: many(productToAudiences),
  useCases: many(productToUseCases),
}));

export const bundlesRelations = relations(bundles, ({ many }) => ({
  products: many(bundleProducts),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));
```

---

## 🌱 Seed Data

```typescript
// src/lib/db/seed.ts

import { db } from "./index";
import {
  categories,
  productTypes,
  formats,
  audiences,
  useCases,
} from "./schema";

export async function seed() {
  // Categories
  await db.insert(categories).values([
    {
      slug: "christian-faith-devotion",
      name: "Christian Faith & Devotion",
      description:
        "Prayer planners, Bible study guides, and faith-based reflection tools.",
      seoTitle: "Christian Faith & Devotion Resources | DigiInsta Store",
      seoDescription:
        "Discover digital planners, journals, and guides to deepen your Christian faith journey.",
      displayOrder: 1,
    },
    {
      slug: "motherhood-family-life",
      name: "Motherhood & Family Life",
      description:
        "Mom planners, family routines, and gentle home management systems.",
      seoTitle: "Motherhood & Family Planning Tools | DigiInsta Store",
      seoDescription:
        "Digital planners and resources designed specifically for busy moms and families.",
      displayOrder: 2,
    },
    {
      slug: "marriage-couples",
      name: "Marriage & Couples",
      description:
        "Date night planners, marriage finance tools, and communication workbooks.",
      seoTitle: "Marriage & Couples Resources | DigiInsta Store",
      seoDescription:
        "Strengthen your marriage with digital planners, budgeting tools, and relationship-building resources.",
      displayOrder: 3,
    },
    {
      slug: "health-nutrition-body-care",
      name: "Health, Nutrition & Body Care",
      description:
        "Evidence-based meal planners, health trackers, and gentle movement guides.",
      seoTitle: "Health & Nutrition Planning Tools | DigiInsta Store",
      seoDescription:
        "Science-backed digital health trackers and nutrition planners for holistic wellness.",
      displayOrder: 4,
    },
    {
      slug: "students-science-studies",
      name: "Students & Science Studies",
      description:
        "Study planners, exam prep tools, and biomedical science note systems.",
      seoTitle: "Student Study & Science Resources | DigiInsta Store",
      seoDescription:
        "Digital study planners and science-focused resources for students and academics.",
      displayOrder: 5,
    },
    {
      slug: "productivity-life-systems",
      name: "Productivity & Life Systems",
      description:
        "Daily planners, life dashboards, habit trackers, and routine builders.",
      seoTitle: "Productivity & Life Organization Tools | DigiInsta Store",
      seoDescription:
        "Digital planners and systems to help you organize your life and build better habits.",
      displayOrder: 6,
    },
    {
      slug: "small-business-digital-income",
      name: "Small Business & Digital Income",
      description:
        "Business templates, content planning systems, and creator workflows.",
      seoTitle: "Small Business & Creator Resources | DigiInsta Store",
      seoDescription:
        "Digital business tools and templates for entrepreneurs and content creators.",
      displayOrder: 7,
    },
    {
      slug: "creative-templates-printables",
      name: "Creative Templates & Printables",
      description:
        "Canva templates, printable planners, journals, and worksheets.",
      seoTitle: "Creative Templates & Printables | DigiInsta Store",
      seoDescription:
        "Beautiful digital templates and printables for all your creative needs.",
      displayOrder: 8,
    },
  ]);

  // Product Types
  await db.insert(productTypes).values([
    { slug: "planner", name: "Planner", displayOrder: 1 },
    { slug: "workbook", name: "Workbook", displayOrder: 2 },
    { slug: "guide", name: "Guide", displayOrder: 3 },
    { slug: "template", name: "Template", displayOrder: 4 },
    { slug: "dashboard", name: "Dashboard", displayOrder: 5 },
    { slug: "tracker", name: "Tracker", displayOrder: 6 },
    { slug: "journal", name: "Journal", displayOrder: 7 },
    { slug: "checklist", name: "Checklist", displayOrder: 8 },
  ]);

  // Formats
  await db.insert(formats).values([
    { slug: "pdf", name: "PDF", displayOrder: 1 },
    { slug: "notion", name: "Notion", displayOrder: 2 },
    { slug: "goodnotes", name: "GoodNotes", displayOrder: 3 },
    { slug: "canva", name: "Canva", displayOrder: 4 },
    { slug: "google-sheets", name: "Google Sheets", displayOrder: 5 },
    { slug: "excel", name: "Excel", displayOrder: 6 },
    { slug: "printable", name: "Printable", displayOrder: 7 },
  ]);

  // Audiences
  await db.insert(audiences).values([
    { slug: "moms", name: "Moms", displayOrder: 1 },
    { slug: "students", name: "Students", displayOrder: 2 },
    { slug: "couples", name: "Couples", displayOrder: 3 },
    { slug: "creatives", name: "Creatives", displayOrder: 4 },
    { slug: "entrepreneurs", name: "Entrepreneurs", displayOrder: 5 },
    { slug: "christians", name: "Christians", displayOrder: 6 },
  ]);

  // Use Cases
  await db.insert(useCases).values([
    { slug: "daily-planning", name: "Daily Planning", displayOrder: 1 },
    { slug: "habit-building", name: "Habit Building", displayOrder: 2 },
    { slug: "meal-planning", name: "Meal Planning", displayOrder: 3 },
    { slug: "budget-management", name: "Budget Management", displayOrder: 4 },
    { slug: "study-organization", name: "Study Organization", displayOrder: 5 },
    { slug: "content-creation", name: "Content Creation", displayOrder: 6 },
    { slug: "spiritual-growth", name: "Spiritual Growth", displayOrder: 7 },
    {
      slug: "relationship-building",
      name: "Relationship Building",
      displayOrder: 8,
    },
  ]);

  console.log("✅ Database seeded successfully");
}
```

---

## 🛒 Zustand Stores

### Cart Store

```typescript
// src/store/cart.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItemType = "product" | "bundle";

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  slug: string;
  quantity: number;
  lsVariantId: string; // Required - product must be synced to Lemon Squeezy
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, type: CartItemType) => void;
  updateQuantity: (id: string, type: CartItemType, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.id === item.id && i.type === item.type
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id && i.type === item.type
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }

        get().openCart();
      },

      removeItem: (id, type) => {
        set({
          items: get().items.filter((i) => !(i.id === id && i.type === type)),
        });
      },

      updateQuantity: (id, type, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, type);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === id && i.type === type ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
```

### Admin UI Store

```typescript
// src/store/admin-ui.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminUIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAdminUI = create<AdminUIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "admin-ui-storage",
    }
  )
);
```

---

## 🔐 Auth Implementation

```typescript
// src/lib/auth/index.ts

import { db } from "@/lib/db";
import { loginCodes, sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { resend } from "@/lib/email/resend";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const CODE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function sendMagicLink(email: string) {
  if (email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await db.insert(loginCodes).values({
    email,
    code,
    expiresAt: new Date(Date.now() + CODE_DURATION),
  });

  await resend.emails.send({
    from: "DigiInsta Store <noreply@digiinsta.store>",
    to: email,
    subject: "Your login code",
    html: `
      <h2>Your login code is:</h2>
      <h1 style="font-size: 48px; letter-spacing: 8px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}

export async function verifyCode(email: string, code: string) {
  if (email !== ADMIN_EMAIL) {
    return false;
  }

  const validCode = await db.query.loginCodes.findFirst({
    where: and(
      eq(loginCodes.email, email),
      eq(loginCodes.code, code),
      gt(loginCodes.expiresAt, new Date())
    ),
  });

  if (!validCode) {
    return false;
  }

  // Mark code as used
  await db
    .update(loginCodes)
    .set({ usedAt: new Date() })
    .where(eq(loginCodes.id, validCode.id));

  // Create session
  const sessionId = crypto.randomUUID();
  await db.insert(sessions).values({
    id: sessionId,
    adminEmail: email,
    expiresAt: new Date(Date.now() + SESSION_DURATION),
  });

  const cookieStore = await cookies();
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  });

  return true;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())),
  });

  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  cookieStore.delete("session");
}
```

### Middleware Protection

```typescript
// proxy.ts (Next.js 16 - replaces middleware.ts)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/dashboard")) {
    const session = await getSession();

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 💳 Lemon Squeezy Integration

### Overview

**Key Feature:** Products are auto-synced to Lemon Squeezy when created/updated in admin. Vendor never touches Lemon Squeezy dashboard.

**Workflow:**

1. Vendor creates product in DigiInsta admin (starts as draft: `isActive: false`)
2. System automatically creates product + variant in Lemon Squeezy via API
3. If sync succeeds: Product becomes active (`isActive: true`) and purchasable
4. If sync fails: Product stays inactive, vendor can retry sync
5. Lemon Squeezy IDs stored in database (`lsProductId`, `lsVariantId`)
6. On checkout, redirect to Lemon Squeezy checkout URL
7. Webhook handles order completion and fulfillment

**File Delivery:**

- **Display Images**: Stored in Cloudflare R2 (for product galleries, thumbnails)
- **Product Files**: Uploaded to Lemon Squeezy during product sync (digital files customers download)
- Lemon Squeezy handles automatic file delivery after purchase - no custom download page needed

**Benefits:**

- Single source of truth (DigiInsta admin)
- No manual double-entry
- Automatic sync on create/update
- Products only purchasable when successfully synced
- Supports bundles (created as single products)
- Global payment methods (135+ countries)
- Merchant of Record (handles tax/compliance)

### Auto-Sync Product Creation

**Key Feature:** Products are auto-synced to Lemon Squeezy when created/updated in admin. Vendor never touches Lemon Squeezy dashboard.

```typescript
// src/lib/payments/lemon-squeezy.ts

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;
const LS_API_URL = "https://api.lemonsqueezy.com/v1";

interface LSResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

interface LSProduct {
  id: string;
  type: string;
  attributes: {
    name: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

interface LSVariant {
  id: string;
  type: string;
  attributes: {
    name: string;
    price: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

async function lsApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<LSResponse<T>> {
  const res = await fetch(`${LS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${LS_API_KEY}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Lemon Squeezy API error: ${res.statusText} - ${error}`);
  }

  return res.json();
}

export async function syncProductToLS(product: {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  files?: File[]; // Product files to upload to Lemon Squeezy
}): Promise<{ productId: string; variantId: string }> {
  try {
    // 1. Create product in Lemon Squeezy
    const productRes = await lsApi<LSProduct>("/products", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "products",
          attributes: {
            name: product.name,
            description: product.description,
            status: "published",
          },
          relationships: {
            store: {
              data: { type: "stores", id: LS_STORE_ID },
            },
          },
        },
      }),
    });

    const lsProductId = productRes.data.id;

    // 2. Create variant (price point)
    const variantRes = await lsApi<LSVariant>("/variants", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "variants",
          attributes: {
            name: "Default",
            price: Math.round(product.price * 100), // Convert to cents
            status: "published",
          },
          relationships: {
            product: {
              data: { type: "products", id: lsProductId },
            },
          },
        },
      }),
    });

    // 3. Upload product files if provided
    // Note: Lemon Squeezy file upload happens via their dashboard or API
    // Files should be uploaded separately and linked to the variant

    return {
      productId: lsProductId,
      variantId: variantRes.data.id,
    };
  } catch (error) {
    console.error("Lemon Squeezy sync failed:", error);
    throw new Error("Failed to sync product to Lemon Squeezy");
  }
}

export async function updateProductInLS(
  lsProductId: string,
  lsVariantId: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
  }
) {
  try {
    // Update product
    if (updates.name || updates.description) {
      await lsApi(`/products/${lsProductId}`, {
        method: "PATCH",
        body: JSON.stringify({
          data: {
            type: "products",
            id: lsProductId,
            attributes: {
              ...(updates.name && { name: updates.name }),
              ...(updates.description && { description: updates.description }),
            },
          },
        }),
      });
    }

    // Update variant (price)
    if (updates.price !== undefined) {
      await lsApi(`/variants/${lsVariantId}`, {
        method: "PATCH",
        body: JSON.stringify({
          data: {
            type: "variants",
            id: lsVariantId,
            attributes: {
              price: Math.round(updates.price * 100),
            },
          },
        }),
      });
    }
  } catch (error) {
    console.error("Lemon Squeezy update failed:", error);
    // Log but don't fail - product still exists in our DB
    throw error;
  }
}

export async function createLSCheckout(
  variantId: string,
  options: {
    customerEmail?: string;
    customPrice?: number; // For bundles or custom pricing
    successUrl?: string;
    customData?: Record<string, unknown>;
  } = {}
) {
  const checkout = await lsApi<{
    id: string;
    attributes: {
      url: string;
      created_at: string;
    };
  }>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
            desc: true,
            discount: true,
            dark: false,
            subscription_preview: true,
            button_color: "#000000",
          },
          checkout_data: {
            email: options.customerEmail,
            custom: {
              order_id: options.customData?.orderId,
              ...options.customData,
            },
          },
          expires_at: null,
          preview: false,
          test_mode: process.env.NODE_ENV !== "production",
          product_options: {
            enabled_variants: [variantId],
            redirect_url:
              options.successUrl ||
              `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
            receipt_button_text: "Get your download",
            receipt_link_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
            receipt_thank_you_note: "Thank you for your purchase!",
          },
          ...(options.customPrice && {
            custom_price: {
              enabled: true,
              amount: Math.round(options.customPrice * 100),
            },
          }),
        },
        relationships: {
          store: {
            data: { type: "stores", id: LS_STORE_ID },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  return checkout.data.attributes.url;
}

// Create checkout for multiple items (cart)
export async function createMultiItemCheckout(
  items: Array<{ variantId: string; quantity: number; customPrice?: number }>,
  options: {
    customerEmail?: string;
    successUrl?: string;
    customData?: Record<string, unknown>;
  } = {}
) {
  // Lemon Squeezy supports multiple variants in a single checkout
  // Create checkout with all variants
  const checkout = await lsApi<{
    id: string;
    attributes: {
      url: string;
      created_at: string;
    };
  }>("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
            desc: true,
            discount: true,
            dark: false,
            subscription_preview: true,
            button_color: "#000000",
          },
          checkout_data: {
            email: options.customerEmail,
            custom: {
              order_id: options.customData?.orderId,
              ...options.customData,
            },
          },
          expires_at: null,
          preview: false,
          test_mode: process.env.NODE_ENV !== "production",
          product_options: {
            enabled_variants: items.map((item) => item.variantId),
            redirect_url:
              options.successUrl ||
              `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
            receipt_button_text: "Get your download",
            receipt_link_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
            receipt_thank_you_note: "Thank you for your purchase!",
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: LS_STORE_ID },
          },
        },
      },
    }),
  });

  return checkout.data.attributes.url;
}

// Webhook verification
export function verifyLSWebhook(payload: string, signature: string): boolean {
  const crypto = require("crypto");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/lemon-squeezy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, bundles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/email/resend";
import { verifyLSWebhook } from "@/lib/payments/lemon-squeezy";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("x-signature") || "";

  // Verify webhook signature
  if (!verifyLSWebhook(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // Handle order_created event
  if (event.meta?.event_name === "order_created") {
    const orderData = event.data;

    // Check if order already exists
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.lsOrderId, orderData.id),
    });

    if (existingOrder) {
      return NextResponse.json({
        received: true,
        message: "Order already processed",
      });
    }

    // Extract order details
    const orderAttributes = orderData.attributes;
    const customerEmail = orderAttributes.user_email;
    const customerName = orderAttributes.first_name
      ? `${orderAttributes.first_name} ${
          orderAttributes.last_name || ""
        }`.trim()
      : undefined;

    // Calculate totals
    const subtotal = parseFloat(
      orderAttributes.subtotal_formatted?.replace(/[^0-9.]/g, "") || "0"
    );
    const tax = parseFloat(
      orderAttributes.tax_formatted?.replace(/[^0-9.]/g, "") || "0"
    );
    const total = parseFloat(
      orderAttributes.total_formatted?.replace(/[^0-9.]/g, "") || "0"
    );

    // Create order in database
    const [order] = await db
      .insert(orders)
      .values({
        lsOrderId: orderData.id,
        customerEmail,
        customerName,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        currency: orderAttributes.currency || "USD",
        status: orderAttributes.status === "paid" ? "paid" : "pending",
        metadata: orderData,
      })
      .returning();

    // Process order items
    // Fetch order items from Lemon Squeezy API for accurate data
    const orderItemsResponse = await fetch(
      `https://api.lemonsqueezy.com/v1/orders/${orderData.id}/order-items`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );
    const orderItemsData = await orderItemsResponse.json();
    const items = orderItemsData.data || [];

    for (const item of items) {
      const itemAttributes = item.attributes;
      const variantId = itemAttributes.variant_id;

      // Find product by Lemon Squeezy variant ID
      const product = await db.query.products.findFirst({
        where: eq(products.lsVariantId, variantId),
      });

      const bundle = await db.query.bundles.findFirst({
        where: eq(bundles.lsVariantId, variantId),
      });

      if (product) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: product.id,
          bundleId: null, // Ensure exactly one is set
          quantity: itemAttributes.quantity || 1,
          unitPrice: (itemAttributes.price / 100).toString(), // Convert from cents
          totalPrice: (
            (itemAttributes.price * (itemAttributes.quantity || 1)) /
            100
          ).toString(),
          productSnapshot: {
            name: product.name,
            slug: product.slug,
            price: product.price,
            type: "product",
          },
        });

        // Update sales count
        await db
          .update(products)
          .set({
            salesCount: product.salesCount + (itemAttributes.quantity || 1),
          })
          .where(eq(products.id, product.id));
      } else if (bundle) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: null, // Ensure exactly one is set
          bundleId: bundle.id,
          quantity: itemAttributes.quantity || 1,
          unitPrice: (itemAttributes.price / 100).toString(),
          totalPrice: (
            (itemAttributes.price * (itemAttributes.quantity || 1)) /
            100
          ).toString(),
          productSnapshot: {
            name: bundle.name,
            slug: bundle.slug,
            price: bundle.price,
            type: "bundle",
          },
        });

        await db
          .update(bundles)
          .set({
            salesCount: bundle.salesCount + (itemAttributes.quantity || 1),
          })
          .where(eq(bundles.id, bundle.id));
      }
    }

    // Mark order as fulfilled (Lemon Squeezy handles file delivery)
    await db
      .update(orders)
      .set({ fulfillmentStatus: "fulfilled" })
      .where(eq(orders.id, order.id));

    // Send confirmation email (Lemon Squeezy handles file delivery automatically)
    await resend.emails.send({
      from: "DigiInsta Store <orders@digiinsta.store>",
      to: customerEmail,
      subject: "Order Confirmation - Download Your Products",
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Order ID: ${order.id}</p>
        <p>Your download links have been sent to your email by Lemon Squeezy.</p>
        <p>You can also access them in your customer portal: <a href="${orderAttributes.urls?.customer_portal}">View Order</a></p>
      `,
    });
  }

  return NextResponse.json({ received: true });
}
```

### Bundle Sync & Price Calculation

```typescript
// Calculate bundle price from included products
export function calculateBundlePrice(
  includedProducts: Array<{ price: number }>,
  priceOverride?: number | null
): number {
  if (priceOverride !== null && priceOverride !== undefined) {
    return priceOverride;
  }

  // Auto-calculate: sum of all product prices with discount
  const totalValue = includedProducts.reduce(
    (sum, p) => sum + parseFloat(p.price.toString()),
    0
  );

  // Apply 20% bundle discount by default (can be configured)
  const BUNDLE_DISCOUNT = 0.2;
  return totalValue * (1 - BUNDLE_DISCOUNT);
}

export async function syncBundleToLS(bundle: {
  name: string;
  description: string;
  price: number;
  products: Array<{ name: string; price: number }>;
}) {
  // Calculate total value of included products
  const totalValue = bundle.products.reduce(
    (sum, p) => sum + parseFloat(p.price.toString()),
    0
  );
  const savings = totalValue - bundle.price;

  // Create bundle as single product in Lemon Squeezy
  const bundleDescription = `
    ${bundle.description}
    
    <h3>Includes:</h3>
    <ul>
      ${bundle.products.map((p) => `<li>${p.name}</li>`).join("\n")}
    </ul>
    
    <p><strong>Total Value: $${totalValue.toFixed(2)}</strong></p>
    <p><strong>Bundle Price: $${bundle.price.toFixed(2)}</strong></p>
    <p><strong>You Save: $${savings.toFixed(2)}</strong></p>
  `;

  return syncProductToLS({
    name: bundle.name,
    description: bundleDescription,
    price: bundle.price,
  });
}
```

### Admin Product Form Integration

```typescript
// src/app/(admin)/dashboard/products/actions.ts

"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  syncProductToLS,
  updateProductInLS,
} from "@/lib/payments/lemon-squeezy";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils/slugify";

export async function createProduct(formData: FormData) {
  // 1. Extract and validate data
  const productData = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string),
    description: formData.get("description") as string,
    categoryId: formData.get("categoryId") as string,
    // ... other fields
  };

  // 2. Create in our database FIRST as draft (source of truth)
  // Product starts inactive until sync succeeds
  const [product] = await db
    .insert(products)
    .values({
      ...productData,
      slug: slugify(productData.name),
      syncStatus: "pending",
      isActive: false, // Draft by default
      // Auto-generate SEO fields if not provided
      seoTitle: productData.seoTitle || productData.name,
      seoDescription:
        productData.seoDescription || productData.shortDescription || "",
    })
    .returning();

  // 3. Auto-sync to Lemon Squeezy immediately
  try {
    const { productId, variantId } = await syncProductToLS({
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
    });

    // 4. Update product with Lemon Squeezy IDs and activate
    await db
      .update(products)
      .set({
        lsProductId: productId,
        lsVariantId: variantId,
        syncStatus: "synced",
        isActive: true, // Only activate when sync succeeds
        lastSyncedAt: new Date(),
        syncError: null,
      })
      .where(eq(products.id, product.id));
  } catch (error) {
    // Sync failed - product stays inactive (draft)
    console.error("Lemon Squeezy sync failed:", error);
    await db
      .update(products)
      .set({
        syncStatus: "failed",
        isActive: false, // Keep inactive
        syncError: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(products.id, product.id));
    throw error; // Re-throw so form shows error to vendor
  }

  revalidatePath("/dashboard/products");
  return product;
}

export async function updateProduct(productId: string, formData: FormData) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!product) throw new Error("Product not found");

  // Update in database
  const updates = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string),
    description: formData.get("description") as string,
    // Auto-generate SEO if not provided
    seoTitle:
      (formData.get("seoTitle") as string) || (formData.get("name") as string),
    seoDescription:
      (formData.get("seoDescription") as string) ||
      (formData.get("shortDescription") as string) ||
      "",
    // ... other fields
  };

  await db.update(products).set(updates).where(eq(products.id, productId));

  // Sync to Lemon Squeezy if IDs exist
  if (product.lsProductId && product.lsVariantId) {
    try {
      await updateProductInLS(product.lsProductId, product.lsVariantId, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
      });

      await db
        .update(products)
        .set({
          syncStatus: "synced",
          isActive: true, // Ensure active after successful sync
          lastSyncedAt: new Date(),
          syncError: null,
        })
        .where(eq(products.id, productId));
    } catch (error) {
      console.error("Lemon Squeezy update failed:", error);
      await db
        .update(products)
        .set({
          syncStatus: "failed",
          isActive: false, // Deactivate if sync fails
          syncError: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(products.id, productId));
    }
  }

  revalidatePath("/dashboard/products");
}

// Retry failed syncs (called from admin UI)
export async function retryProductSync(productId: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });

  if (!product) throw new Error("Product not found");

  try {
    const { productId: lsProductId, variantId: lsVariantId } =
      await syncProductToLS({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
      });

    await db
      .update(products)
      .set({
        lsProductId,
        lsVariantId,
        syncStatus: "synced",
        isActive: true, // Activate on successful sync
        lastSyncedAt: new Date(),
        syncError: null,
      })
      .where(eq(products.id, productId));

    return { success: true };
  } catch (error) {
    await db
      .update(products)
      .set({
        syncStatus: "failed",
        isActive: false,
        syncError: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(products.id, productId));
    throw error;
  }
}

// Bulk retry failed syncs (admin action)
export async function retryFailedSyncs() {
  const failedProducts = await db.query.products.findMany({
    where: eq(products.syncStatus, "failed"),
  });

  const results = [];
  for (const product of failedProducts) {
    try {
      await retryProductSync(product.id);
      results.push({ productId: product.id, success: true });
    } catch (error) {
      results.push({ productId: product.id, success: false, error });
    }
  }

  return results;
}
```

### Checkout Flow

```typescript
// src/app/api/checkout/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  createLSCheckout,
  createMultiItemCheckout,
} from "@/lib/payments/lemon-squeezy";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { items, customerEmail } = await request.json(); // Cart items with lsVariantId

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Validate all items have variant IDs (required)
  const itemsWithoutSync = items.filter((item: any) => !item.lsVariantId);
  if (itemsWithoutSync.length > 0) {
    return NextResponse.json(
      {
        error:
          "Some products are not synced to Lemon Squeezy and cannot be purchased",
      },
      { status: 400 }
    );
  }

  try {
    let checkoutUrl: string;

    if (items.length === 1) {
      // Single item checkout
      checkoutUrl = await createLSCheckout(items[0].lsVariantId, {
        customerEmail,
        successUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
        customData: {
          orderId: crypto.randomUUID(),
          items: items.map((i: any) => ({ id: i.id, type: i.type })),
        },
      });
    } else {
      // Multiple items checkout
      checkoutUrl = await createMultiItemCheckout(
        items.map((item: any) => ({
          variantId: item.lsVariantId,
          quantity: item.quantity,
        })),
        {
          customerEmail,
          successUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
          customData: {
            orderId: crypto.randomUUID(),
            items: items.map((i: any) => ({ id: i.id, type: i.type })),
          },
        }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
```

### Sync Status Management

**Critical Rule:** Products are draft by default (`isActive: false`) and only become active (`isActive: true`) when successfully synced to Lemon Squeezy.

Products have a `syncStatus` field to track Lemon Squeezy sync state:

- `pending`: Not yet synced (newly created, inactive)
- `synced`: Successfully synced to Lemon Squeezy (active, purchasable)
- `failed`: Sync failed (inactive, can retry)

**Behavior:**

- New products start as draft (`isActive: false`)
- Sync happens immediately on creation
- If sync succeeds → product becomes active and purchasable
- If sync fails → product stays inactive, vendor can retry
- Only active products appear in storefront
- Cart validation prevents adding unsynced products

Admin can:

- View sync status badge in product list
- See "Retry Sync" button for failed products
- Bulk retry all failed syncs
- See sync errors for debugging
- Manually toggle `isActive` if needed (advanced)

### File Delivery

**Decision: Lemon Squeezy handles all file delivery automatically**

**File Types:**

1. **Display Images** (stored in Cloudflare R2):

   - Product gallery images
   - Thumbnails
   - Category images
   - "What's Inside" images
   - Used for storefront display only

2. **Product Files** (stored in Lemon Squeezy):
   - Digital product files (PDFs, templates, etc.)
   - Uploaded to Lemon Squeezy during product sync
   - Automatically delivered to customers after purchase
   - Customers receive download links via email from Lemon Squeezy

**Workflow:**

- Vendor uploads product files in admin form
- Files are uploaded to Lemon Squeezy when product syncs
- After purchase, Lemon Squeezy automatically emails download links
- No custom download page needed - Lemon Squeezy handles everything
- Success page shows: "Check your email for download links" + link to Lemon Squeezy customer portal

---

## 📦 Phase-by-Phase Development Plan

### **Phase 1: Foundation (Week 1)**

**Goal:** Database, auth, and basic structure

**Tasks:**

1. ✅ Initialize Next.js project with TypeScript
2. ✅ Setup Drizzle ORM + Neon connection
3. ✅ Create all database schema tables
4. ✅ Run migrations
5. ✅ Seed taxonomy data (categories, formats, etc.)
6. ✅ Setup Cloudflare R2 client
7. ✅ Implement manual auth (magic link)
8. ✅ Create middleware for admin protection
9. ✅ Setup Resend email client
10. ✅ Install shadcn/ui base components

**Deliverables:**

- Database schema complete and seeded
- Admin can login with magic link
- Environment variables configured

---

### **Phase 2: Admin Dashboard - Products (Week 2)**

**Goal:** Admin can manage products end-to-end

**Tasks:**

1. ✅ Admin dashboard layout with sidebar
2. ✅ Products list page with data table
3. ✅ Create product form (single page, progressive disclosure)
   - Basic info (name, price, category)
   - Rich text editor (Tiptap) for description
   - Display image uploader (max 10 images, R2)
   - Product file uploader (Lemon Squeezy)
   - Taxonomy selectors (product types, formats, audiences, use cases)
   - "What's Inside" section (title + image only)
   - YouTube video URL
   - SEO fields (auto-generated, can override)
   - Auto-save every 30 seconds
   - Real-time validation feedback
4. ✅ Edit product form
5. ✅ Delete product (soft delete with deletedAt)
6. ✅ Image upload to R2
7. ✅ Product slug auto-generation
8. ✅ Form validation (Zod)
9. ✅ Sync status display and retry button
10. ✅ Product starts as draft, activates when synced

**Deliverables:**

- Admin can CRUD products
- Images upload to R2
- Rich text works properly

---

### **Phase 3: Admin Dashboard - Other Entities (Week 2)**

**Goal:** Admin can manage everything

**Tasks:**

1. ✅ Categories CRUD
   - Form with image upload
   - SEO fields
   - Display order
2. ✅ Bundles CRUD
   - Product selector (multi-select)
   - Auto-calculate price from included products
   - Show savings calculation (total value vs bundle price)
   - Manual price override option
   - Starts as draft, activates when synced
3. ✅ Taxonomy management (product types, formats, audiences, use cases)
   - Simple CRUD for each
4. ✅ Promo banners management
   - Text, link, colors
   - Active toggle
5. ✅ Orders dashboard
   - List with filters (status, date range, customer email)
   - Order detail page
   - Fulfillment status tracking
   - Customer lookup by email
   - Order history per customer

**Deliverables:**

- Complete admin CRUD functionality
- All entities manageable

---

### **Phase 4: Storefront - Core Pages (Week 3)**

**Goal:** Customers can browse products

**Tasks:**

1. ✅ Homepage
   - Hero section
   - Promo banner
   - Featured products
   - New arrivals
   - Category cards
2. ✅ Header with mega menu
   - Category navigation with images
   - Quick links (New, Bestsellers, Bundles, Sale)
3. ✅ Product listing page
   - Grid layout
   - Filters (formats, product types, audiences, use cases)
   - Sort options
   - Pagination
4. ✅ Product detail page
   - Image gallery (Embla carousel)
   - Description (render rich text HTML)
   - "What's Inside" section
   - YouTube video embed
   - Add to cart button
   - Recommendations
5. ✅ Category page
   - Same as product listing but filtered
6. ✅ Bundles listing
7. ✅ Bundle detail page
   - Show included products
   - Savings calculation

**Deliverables:**

- Browseable storefront
- Products display correctly
- Filtering works

---

### **Phase 5: Cart & Checkout (Week 3)**

**Goal:** Customers can purchase

**Tasks:**

1. ✅ Cart drawer (Zustand)
   - Add/remove items
   - Update quantity
   - Show subtotal
2. ✅ Cart page (full view)
3. ✅ Checkout flow
   - Create Lemon Squeezy checkout session
   - Redirect to Lemon Squeezy
   - Handle success callback
4. ✅ Checkout success page
   - Order summary
   - "Check your email for download links" message
   - Link to Lemon Squeezy customer portal
5. ✅ Lemon Squeezy webhook integration
   - Create orders in database
   - Set fulfillment status
   - Send confirmation email (Lemon Squeezy handles file delivery)

**Deliverables:**

- End-to-end purchase flow works
- Orders created in database
- Emails sent

---

### **Phase 6: SEO & Polish (Week 4)**

**Goal:** Production-ready

**Tasks:**

1. ✅ SEO metadata for all pages
   - Dynamic meta tags
   - Open Graph tags
   - JSON-LD schema
2. ✅ Sitemap generation
3. ✅ robots.txt
4. ✅ 404 page
5. ✅ Loading states
6. ✅ Error boundaries
7. ✅ Mobile menu
8. ✅ Responsive design audit
9. ✅ Performance optimization
   - Image optimization
   - Lazy loading
   - Code splitting
10. ✅ Accessibility audit
11. ✅ Legal pages (Privacy, Terms, Refund)
12. ✅ About, FAQ, Contact pages
13. ✅ Footer
14. ✅ Umami analytics integration

**Deliverables:**

- SEO optimized
- Mobile-perfect
- Fast load times
- Legal compliance

---

## 🎨 Key Components to Build

### Storefront Components

1. **Header with Mega Menu**

   - Desktop: Hover mega menu with category images
   - Mobile: Drawer menu
   - Cart icon with item count

2. **Product Card**

   - Image with lazy loading
   - Name, price, compare-at price
   - "On Sale" badge
   - "New" badge
   - Quick add to cart

3. **Product Filters**

   - Checkboxes for each taxonomy
   - Price range slider
   - Clear filters button
   - Active filter tags

4. **Product Gallery**

   - Embla carousel
   - Thumbnails
   - Zoom on click
   - Mobile swipe

5. **Cart Drawer**
   - Slide from right
   - Item list with thumbnails
   - Quantity controls
   - Subtotal
   - Checkout button

### Admin Components

1. **Data Table** (reusable)

   - Sorting
   - Pagination
   - Row actions (edit, delete)
   - Bulk actions

2. **Product Form**

   - Single page with progressive disclosure (advanced fields collapsed)
   - Real-time validation with Zod
   - Image preview grid
   - Rich text editor (Tiptap)
   - Product file uploader (for Lemon Squeezy)
   - Auto-save every 30 seconds
   - Sync status indicator
   - Retry sync button (if failed)

3. **Image Uploader**

   - Drag & drop
   - Multiple files
   - Progress bar
   - Preview grid
   - Reorder images
   - Set primary image

4. **Rich Text Editor** (Tiptap)

   - Headings
   - Bold, italic, underline
   - Lists
   - Links
   - Images
   - HTML view

5. **Stats Cards**
   - Total orders
   - Revenue (from orders table)
   - Active products count
   - Failed syncs count (with retry button)
   - Sales chart (over time)
   - Top products by sales
   - Revenue by category

---

## 🔧 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="digiinsta-products"
R2_PUBLIC_URL="https://..."

# Email
RESEND_API_KEY=""

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=""
LEMONSQUEEZY_STORE_ID=""
LEMONSQUEEZY_WEBHOOK_SECRET=""

# Auth
ADMIN_EMAIL="admin@digiinsta.store"

# App
NEXT_PUBLIC_URL="https://digiinsta.store"
NODE_ENV="development"

# Analytics (optional)
UMAMI_WEBSITE_ID=""
```

---

## 📊 Success Metrics

**Technical:**

- Lighthouse score: 90+ all categories
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Zero layout shift (CLS: 0)

**Functional:**

- Admin can create product in <2 minutes
- Customer can checkout in <30 seconds
- Mobile-first responsive on all devices
- SEO: All product pages indexed within 1 week

---

## 🚀 Deployment Checklist

**Pre-launch:**

- [ ] All environment variables set in Vercel
- [ ] Database migrated to production
- [ ] Seed data loaded
- [ ] R2 bucket configured with CORS
- [ ] Lemon Squeezy webhooks configured
- [ ] Domain DNS pointed to Vercel
- [ ] SSL certificate active
- [ ] Error tracking setup (Sentry optional)
- [ ] Umami analytics script added

**Post-launch:**

- [ ] Submit sitemap to Google Search Console
- [ ] Test complete purchase flow
- [ ] Monitor webhook logs
- [ ] Check email deliverability
- [ ] Performance monitoring

---

## 🎯 Priority Order for Claude Code

If building with Claude Code, tackle in this exact order:

1. **Database setup** (schema, migrations, seed) - CRITICAL
2. **Auth system** (login, verify, session) - BLOCKS admin
3. **Admin product CRUD** - CORE FEATURE
4. **Image upload to R2** - DEPENDENCY
5. **Admin other entities** - EXTEND
6. **Storefront product pages** - CUSTOMER-FACING
7. **Cart + Zustand** - PURCHASE FLOW
8. **Lemon Squeezy checkout** - REVENUE
9. **Webhooks** - ORDER FULFILLMENT
10. **SEO + polish** - OPTIMIZATION

This ensures you can:

- Test admin immediately after step 3
- Add real products after step 4
- Show customers products after step 6
- Accept payments after step 9

---

## 📝 Notes for Claude Code

**When building:**

- Use Server Components by default
- Only use "use client" when necessary (forms, interactive)
- Always validate with Zod
- Use Drizzle query builder, not raw SQL
- Keep components small and focused
- Extract reusable logic to lib/utils
- Add proper TypeScript types (no `any` types)
- Handle loading and error states
- Test on mobile first
- Products must be synced before they can be purchased
- Always filter out deleted products (`deletedAt IS NULL`)
- Always filter active products (`isActive = true`) in storefront queries
- Use discriminated unions for order items (product OR bundle, never both)

**Common patterns:**

```typescript
// Server Component pattern - ALWAYS filter active and non-deleted
import { and, eq, isNull } from "drizzle-orm";

export default async function ProductsPage() {
  const products = await db.query.products.findMany({
    where: and(
      eq(products.isActive, true), // Only active products
      isNull(products.deletedAt) // Not deleted
    ),
  });
  return <ProductGrid products={products} />;
}

// Client Component pattern - Validate sync before adding to cart
("use client");
export function AddToCartButton({ product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Ensure product is synced before adding
    if (!product.lsVariantId) {
      toast.error("Product is not ready for purchase yet");
      return;
    }

    addItem({
      ...product,
      lsVariantId: product.lsVariantId, // Required
    });
  };

  return <Button onClick={handleAddToCart}>Add to Cart</Button>;
}

// Form pattern with auto-save
("use client");
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

export function ProductForm() {
  const form = useForm({
    resolver: zodResolver(productSchema),
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (form.formState.isDirty) {
        // Save draft logic
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [form.formState.isDirty]);

  // ...
}

// Query pattern for storefront - always filter
export async function getActiveProducts() {
  return db.query.products.findMany({
    where: and(
      eq(products.isActive, true),
      eq(products.syncStatus, "synced"), // Double-check sync status
      isNull(products.deletedAt)
    ),
  });
}
```
