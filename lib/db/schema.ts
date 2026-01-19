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
