export interface LemonProduct {
  id: string
  type: string
  attributes: {
    store_id: number
    name: string
    slug: string
    description: string
    status: string
    status_formatted: string
    thumb_url: string
    large_thumb_url: string
    price: number
    price_formatted: string
    from_price: number | null
    to_price: number | null
    pay_what_you_want: boolean
    buy_now_url: string
    created_at: string
    updated_at: string
    test_mode: boolean
  }
  relationships: {
    store: {
      links: {
        related: string
        self: string
      }
    }
    variants: {
      links: {
        related: string
        self: string
      }
    }
  }
  links: {
    self: string
  }
}

export interface Product {
  id: string
  lemon_product_id: string
  lemon_variant_id: string
  subcategory_id: string | null
  title: string
  slug: string
  price: number | null
  description: string | null
  details: Record<string, any> | null
  status: "active" | "draft" | "archived"
  is_physical: boolean
  tags: string[] | null
  created_at: string | null
  updated_at: string | null
  images?: ProductImage[]
}

export interface Bundle {
  id: string
  lemon_product_id: string
  lemon_variant_id: string
  title: string
  slug: string
  tagline: string | null
  description: string | null
  price: number | null
  hero_image_url: string | null
  status: "active" | "draft" | "archived"
  created_at: string | null
  updated_at: string | null
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  caption: string | null
  sort_order: number | null
}

export interface ManagedAndUnmanagedProducts {
  managed: Product[]
  unmanaged: LemonProduct[]
}

export interface UpsertProductData {
  lemon_product_id: string
  lemon_variant_id: string
  subcategory_id?: string | null
  title: string
  slug: string
  price?: number | null
  description?: string | null
  details?: Record<string, any> | null
  status?: "active" | "draft" | "archived"
  is_physical?: boolean
  tags?: string[] | null
  images?: ProductImage[]
}

export interface UpsertBundleData {
  lemon_product_id: string
  lemon_variant_id: string
  title: string
  slug: string
  tagline?: string | null
  description?: string | null
  price?: number | null
  hero_image_url?: string | null
  status?: "active" | "draft" | "archived"
  product_ids?: string[]
}
