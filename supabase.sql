-- Drop tables if they already exist (clean slate)
DROP TABLE IF EXISTS bundle_products CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop enums if exist
DROP TYPE IF EXISTS product_status CASCADE;
DROP TYPE IF EXISTS bundle_status CASCADE;
DROP TYPE IF EXISTS category_status CASCADE;

-- Enums for status fields
CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE bundle_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE category_status AS ENUM ('active', 'archived');

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    status category_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lemon_product_id TEXT UNIQUE NOT NULL,
    lemon_variant_id TEXT UNIQUE NOT NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2),
    description TEXT,
    details JSONB,
    status product_status NOT NULL DEFAULT 'active',
    is_physical BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INT DEFAULT 0
);

-- Bundles table
CREATE TABLE bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lemon_product_id TEXT UNIQUE NOT NULL,
    lemon_variant_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    price NUMERIC(10, 2),
    hero_image_url TEXT,
    status bundle_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle-Products join table
CREATE TABLE bundle_products (
    bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (bundle_id, product_id)
);

-- Create storage buckets if they don't exist
-- Note: These need to be created manually in Supabase dashboard or via SQL
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('bundle-images', 'bundle-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);

-- Storage policies for product-images bucket
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to product-images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to view images
CREATE POLICY "Allow authenticated view of product-images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated updates to product-images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Allow authenticated deletes from product-images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage policies for bundle-images bucket
CREATE POLICY "Allow authenticated uploads to bundle-images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'bundle-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated view of bundle-images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'bundle-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated updates to bundle-images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'bundle-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated deletes from bundle-images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'bundle-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage policies for category-images bucket
CREATE POLICY "Allow authenticated uploads to category-images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated view of category-images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated updates to category-images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow authenticated deletes from category-images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'category-images' 
        AND auth.role() = 'authenticated'
    );

create table orders (
    id bigint primary key, -- LS order id
    store_id bigint,
    customer_id bigint,
    identifier uuid,
    order_number bigint,
    user_name text,
    user_email text,
    currency text,
    subtotal integer,
    tax integer,
    total integer,
    discount_total integer,
    status text,
    refunded boolean,
    product_id bigint,
    variant_id bigint,
    product_name text,
    variant_name text,
    created_at timestamptz,
    updated_at timestamptz,
    receipt_url text
);

create table if not exists hero_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_text text,
  cta_url text,
  image_url text not null,
  start_date timestamptz,
  end_date timestamptz,
  active boolean default true
);


create index idx_orders_created_at on orders(created_at desc);
create index idx_orders_status on orders(status);
create index idx_orders_product_id on orders(product_id);
create index idx_orders_email on orders(user_email);


-- Indexes for search and filtering
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_title_gin ON products USING gin (to_tsvector('english', title));
CREATE INDEX idx_products_tags_gin ON products USING gin (tags);
CREATE INDEX idx_bundles_slug ON bundles(slug);
CREATE INDEX idx_bundle_products_bundle_id ON bundle_products(bundle_id);
CREATE INDEX idx_bundle_products_product_id ON bundle_products(product_id);

-- Disable RLS for now
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE bundles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_products DISABLE ROW LEVEL SECURITY;
