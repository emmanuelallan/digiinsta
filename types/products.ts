export interface LemonProductAttributes {
  store_id: number
  name: string
  slug: string
  description?: string | null
  status: string
  status_formatted?: string
  thumb_url?: string | null
  large_thumb_url?: string | null
  price?: number | null
  price_formatted?: string | null
  from_price?: number | null
  to_price?: number | null
  pay_what_you_want?: boolean
  buy_now_url?: string | null
  created_at: string
  updated_at: string
  test_mode?: boolean
}

export interface LemonProduct {
  type: "products"
  id: string
  attributes: LemonProductAttributes
}

export interface Product {
  id: string
  lemon_product_id: string
  title: string
  slug: string
  description?: string | null
  thumb_url?: string | null
  price?: number | null
  status: "active" | "inactive"
  category_ids?: string[] | null
  created_at: string
  updated_at: string
}

export interface UpsertProductData {
  lemon_product_id: string
  title: string
  slug: string
  description?: string | null
  thumb_url?: string | null
  price?: number | null
  status?: "active" | "inactive"
  category_ids?: string[]
}

export interface ManagedAndUnmanagedProducts {
  managed: Product[]
  unmanaged: LemonProduct[]
}