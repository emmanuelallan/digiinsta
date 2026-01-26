import { pgTable, text, timestamp, real, boolean, uuid, index, primaryKey } from 'drizzle-orm/pg-core';

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  lemonSqueezyId: text('lemon_squeezy_id').unique().notNull(),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  currency: text('currency').notNull(),
  images: text('images').array().notNull().default([]),
  buyNowUrl: text('buy_now_url'), // Lemon Squeezy checkout URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Legacy foreign keys - kept for backward compatibility during migration
  // These will be deprecated in favor of many-to-many relationships
  productTypeId: uuid('product_type_id').references(() => productTypes.id),
  occasionId: uuid('occasion_id').references(() => occasions.id),
  collectionId: uuid('collection_id').references(() => collections.id),
}, (table) => ({
  // Indexes for better query performance
  slugIdx: index('products_slug_idx').on(table.slug),
  productTypeIdx: index('product_type_idx').on(table.productTypeId),
  occasionIdx: index('occasion_idx').on(table.occasionId),
  collectionIdx: index('collection_idx').on(table.collectionId),
  createdAtIdx: index('products_created_at_idx').on(table.createdAt),
}));

// Product Types table (Simple Taxonomy)
export const productTypes = pgTable('product_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Formats table (Simple Taxonomy)
export const formats = pgTable('formats', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Many-to-many relationship for products and formats
export const productFormats = pgTable('product_formats', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  formatId: uuid('format_id').references(() => formats.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.formatId] }),
  // Indexes for join queries
  productIdx: index('product_formats_product_idx').on(table.productId),
  formatIdx: index('product_formats_format_idx').on(table.formatId),
}));

// Many-to-many relationship for products and collections
export const productCollections = pgTable('product_collections', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  collectionId: uuid('collection_id').references(() => collections.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.collectionId] }),
  // Indexes for join queries
  productIdx: index('product_collections_product_idx').on(table.productId),
  collectionIdx: index('product_collections_collection_idx').on(table.collectionId),
}));

// Many-to-many relationship for products and occasions
export const productOccasions = pgTable('product_occasions', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  occasionId: uuid('occasion_id').references(() => occasions.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.occasionId] }),
  // Indexes for join queries
  productIdx: index('product_occasions_product_idx').on(table.productId),
  occasionIdx: index('product_occasions_occasion_idx').on(table.occasionId),
}));

// Many-to-many relationship for products and product types
export const productProductTypes = pgTable('product_product_types', {
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productTypeId: uuid('product_type_id').references(() => productTypes.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.productTypeId] }),
  // Indexes for join queries
  productIdx: index('product_product_types_product_idx').on(table.productId),
  productTypeIdx: index('product_product_types_product_type_idx').on(table.productTypeId),
}));

// Occasions table (Complex Taxonomy)
export const occasions = pgTable('occasions', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').unique().notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('occasions_slug_idx').on(table.slug),
}));

// Collections table (Complex Taxonomy)
export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').unique().notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('collections_slug_idx').on(table.slug),
}));

// Sessions table for authentication
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: text('token').unique().notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
}, (table) => ({
  // Index for session expiration cleanup queries
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
}));

// OTPs table for authentication
export const otps = pgTable('otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
}, (table) => ({
  emailCodeIdx: index('email_code_idx').on(table.email, table.code),
}));

// Email subscriptions table for newsletter
export const emailSubscriptions = pgTable('email_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  source: text('source').notNull(), // 'homepage' | 'checkout'
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
}, (table) => ({
  emailIdx: index('email_subscriptions_email_idx').on(table.email),
}));
