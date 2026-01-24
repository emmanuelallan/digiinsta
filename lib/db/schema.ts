import { pgTable, text, timestamp, real, boolean, uuid, index, primaryKey } from 'drizzle-orm/pg-core';

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  lemonSqueezyId: text('lemon_squeezy_id').unique().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  currency: text('currency').notNull(),
  images: text('images').array().notNull().default([]),
  buyNowUrl: text('buy_now_url'), // Lemon Squeezy checkout URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // Taxonomy associations (foreign keys)
  productTypeId: uuid('product_type_id').references(() => productTypes.id),
  occasionId: uuid('occasion_id').references(() => occasions.id),
  collectionId: uuid('collection_id').references(() => collections.id),
}, (table) => ({
  // Indexes for better query performance
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

// Occasions table (Complex Taxonomy)
export const occasions = pgTable('occasions', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').unique().notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Collections table (Complex Taxonomy)
export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').unique().notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

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
