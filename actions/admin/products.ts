"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { LemonProduct, ManagedAndUnmanagedProducts, Product, Bundle, UpsertProductData, UpsertBundleData } from "@/types/products"
import { productSchema, updateProductSchema, bundleSchema, updateBundleSchema } from "@/schema/products"
import type { Tables } from "@/types/supabase"

const LEMON_API = "https://api.lemonsqueezy.com/v1/products"

async function fetchAllLemonProducts(apiKey: string, storeId?: string): Promise<LemonProduct[]> {
  const headers = {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  }

  const collected: LemonProduct[] = []
  let url = new URL(LEMON_API)
  url.searchParams.set("sort", "name")
  if (storeId) url.searchParams.set("filter[store_id]", storeId)

  const maxRetries = 3
  let retryCount = 0

  try {
    while (true) {
      
      // Create AbortController with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      try {
        const res = await fetch(url.toString(), { 
          headers, 
          cache: "no-store",
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error(`Lemon Squeezy API error (${res.status}):`, errorText)
          throw new Error(`Lemon Squeezy request failed (${res.status}): ${errorText}`)
        }
        
        const json = await res.json()
        
        if (Array.isArray(json?.data)) {
          collected.push(...json.data)
        } else {
          // API response data is not an array, skip this page
        }
        
        const next = json?.links?.next as string | undefined
        if (!next) {
          break
        }
        url = new URL(next)
        
        // Reset retry count on successful request
        retryCount = 0
        
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Lemon Squeezy API request timed out after 30 seconds')
        }
        
        // Retry logic for network errors
        if (retryCount < maxRetries) {
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)) // Exponential backoff
          continue
        }
        
        throw fetchError
      }
    }
  } catch (error) {
    console.error("Error in fetchAllLemonProducts:", error)
    throw error
  }

  return collected
}

export async function getManagedProducts(): Promise<{ data: Product[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    // First get all products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (productsError) {
      return { data: null, error: productsError.message }
    }

    if (!products || products.length === 0) {
      return { data: [], error: null }
    }

    // Then get all images for these products
    const productIds = products.map(p => p.id)
    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("*")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true })

    if (imagesError) {
      console.error("Error fetching product images:", imagesError)
      // Don't fail the whole request if images fail, just return products without images
    }

    // Group images by product_id
    const imagesByProduct = new Map<string, any[]>()
    if (images) {
      images.forEach(img => {
        if (!imagesByProduct.has(img.product_id)) {
          imagesByProduct.set(img.product_id, [])
        }
        imagesByProduct.get(img.product_id)!.push(img)
      })
    }

    // Attach images to products
    const productsWithImages = products.map(product => ({
      ...product,
      images: imagesByProduct.get(product.id) || []
    }))
    
    return { data: productsWithImages, error: null }
  } catch (err) {
    console.error("Exception in getManagedProducts:", err)
    return { data: null, error: `Failed to fetch products: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function getManagedBundles(): Promise<{ data: Bundle[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error("Exception in getManagedBundles:", err)
    return { data: null, error: `Failed to fetch bundles: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function getLemonProductsNotInSupabase(): Promise<{ data: LemonProduct[] | null; error: string | null }> {
  try {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID
    
    if (!apiKey) return { data: null, error: "Missing Lemon Squeezy API key" }

    const lemonProducts = await fetchAllLemonProducts(apiKey, storeId)

    const supabase = await createClient()
    const [managedProducts, managedBundles] = await Promise.all([
      supabase.from("products").select("lemon_product_id"),
      supabase.from("bundles").select("lemon_product_id")
    ])

    if (managedProducts.error) {
      return { data: null, error: managedProducts.error.message }
    }
    if (managedBundles.error) {
      return { data: null, error: managedBundles.error.message }
    }

    const managedIds = new Set([
      ...(managedProducts.data ?? []).map((p) => p.lemon_product_id),
      ...(managedBundles.data ?? []).map((b) => b.lemon_product_id)
    ])
    
    const unmanaged = lemonProducts.filter((p) => !managedIds.has(p.id))

    return { data: unmanaged, error: null }
  } catch (err) {
    console.error("Error in getLemonProductsNotInSupabase:", err)
    return { data: null, error: `Failed to fetch Lemon Squeezy products: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function getProductsSplit(): Promise<{ data: ManagedAndUnmanagedProducts | null; error: string | null }> {
  try {
    const [managedRes, unmanagedRes] = await Promise.all([getManagedProducts(), getLemonProductsNotInSupabase()])
    if (managedRes.error) return { data: null, error: managedRes.error }
    if (unmanagedRes.error) return { data: null, error: unmanagedRes.error }

    return { data: { managed: managedRes.data ?? [], unmanaged: unmanagedRes.data ?? [] }, error: null }
  } catch (err) {
    return { data: null, error: "Failed to split product lists" }
  }
}

export async function upsertProduct(formData: UpsertProductData): Promise<{ data: Product | null; error: string | null }> {
  try {
    const validated = productSchema.parse(formData)
    const supabase = await createClient()

    // Check duplicate lemon_product_id
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("lemon_product_id", validated.lemon_product_id)
      .limit(1)
      .maybeSingle()

    if (existing) {
      const { data: updatedProduct, error } = await supabase
        .from("products")
        .update({
          title: validated.title,
          slug: validated.slug,
          description: validated.description || null,
          price: validated.price ?? null,
          status: validated.status ?? "active",
          subcategory_id: validated.subcategory_id ?? null,
          is_physical: validated.is_physical ?? false,
          tags: validated.tags ?? null,
          details: validated.details ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()
      if (error) return { data: null, error: error.message }
      
      // Get the associated images for this product
      const { data: images, error: imagesError } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", existing.id)
        .order("sort_order", { ascending: true })

      if (imagesError) {
        console.error("Error fetching product images after update:", imagesError)
        // Return product without images if image fetch fails
        revalidatePath("/admin/products")
        return { data: updatedProduct, error: null }
      }

      // Attach images to the updated product
      const productWithImages = {
        ...updatedProduct,
        images: images || []
      }

      revalidatePath("/admin/products")
      return { data: productWithImages, error: null }
    }

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert([
        {
          lemon_product_id: validated.lemon_product_id,
          lemon_variant_id: validated.lemon_variant_id,
          title: validated.title,
          slug: validated.slug,
          description: validated.description || null,
          price: validated.price ?? null,
          status: validated.status ?? "active",
          subcategory_id: validated.subcategory_id ?? null,
          is_physical: validated.is_physical ?? false,
          tags: validated.tags ?? null,
          details: validated.details ?? null,
        },
      ])
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    // New products won't have images yet, so return with empty array
    const productWithImages = {
      ...newProduct,
      images: []
    }

    revalidatePath("/admin/products")
    return { data: productWithImages, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message ?? "Failed to save product" }
  }
}

export async function updateProduct(formData: { id: string } & Partial<UpsertProductData>): Promise<{ data: Product | null; error: string | null }> {
  try {
    const validated = updateProductSchema.parse(formData)
    const supabase = await createClient()

    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update({
        title: validated.title,
        slug: validated.slug,
        description: validated.description || null,
        price: validated.price ?? null,
        status: validated.status ?? "active",
        subcategory_id: validated.subcategory_id ?? null,
        is_physical: validated.is_physical ?? false,
        tags: validated.tags ?? null,
        details: validated.details ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    // Get the associated images for this product
    const { data: images, error: imagesError } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", validated.id)
      .order("sort_order", { ascending: true })

    if (imagesError) {
      console.error("Error fetching product images after update:", imagesError)
      // Return product without images if image fetch fails
      revalidatePath("/admin/products")
      return { data: updatedProduct, error: null }
    }

    // Attach images to the updated product
    const productWithImages = {
      ...updatedProduct,
      images: images || []
    }

    revalidatePath("/admin/products")
    return { data: productWithImages, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message ?? "Failed to update product" }
  }
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/products")
    return { error: null }
  } catch (error) {
    return { error: "Failed to delete product" }
  }
}

export async function upsertBundle(formData: UpsertBundleData): Promise<{ data: Bundle | null; error: string | null }> {
  try {
    const validated = bundleSchema.parse(formData)
    const supabase = await createClient()

    // Check duplicate lemon_product_id
    const { data: existing } = await supabase
      .from("bundles")
      .select("id")
      .eq("lemon_product_id", validated.lemon_product_id)
      .limit(1)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from("bundles")
        .update({
          title: validated.title,
          slug: validated.slug,
          tagline: validated.tagline || null,
          description: validated.description || null,
          price: validated.price ?? null,
          status: validated.status ?? "active",
          hero_image_url: validated.hero_image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()
      if (error) return { data: null, error: error.message }
      
      // Update bundle products
      if (validated.product_ids) {
        await supabase.from("bundle_products").delete().eq("bundle_id", existing.id)
        if (validated.product_ids.length > 0) {
          await supabase.from("bundle_products").insert(
            validated.product_ids.map(productId => ({
              bundle_id: existing.id,
              product_id: productId
            }))
          )
        }
      }
      
      revalidatePath("/admin/products")
      return { data, error: null }
    }

    const { data, error } = await supabase
      .from("bundles")
      .insert([
        {
          lemon_product_id: validated.lemon_product_id,
          lemon_variant_id: validated.lemon_variant_id,
          title: validated.title,
          slug: validated.slug,
          tagline: validated.tagline || null,
          description: validated.description || null,
          price: validated.price ?? null,
          status: validated.status ?? "active",
          hero_image_url: validated.hero_image_url || null,
        },
      ])
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    // Add bundle products
    if (validated.product_ids && validated.product_ids.length > 0) {
      await supabase.from("bundle_products").insert(
        validated.product_ids.map(productId => ({
          bundle_id: data.id,
          product_id: productId
        }))
      )
    }

    revalidatePath("/admin/products")
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message ?? "Failed to save bundle" }
  }
}

export async function updateBundle(formData: { id: string } & Partial<UpsertBundleData>): Promise<{ data: Bundle | null; error: string | null }> {
  try {
    const validated = updateBundleSchema.parse(formData)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("bundles")
      .update({
        title: validated.title,
        slug: validated.slug,
        tagline: validated.tagline || null,
        description: validated.description || null,
        price: validated.price ?? null,
        status: validated.status ?? "active",
        hero_image_url: validated.hero_image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validated.id)
      .select()
      .single()

    if (error) return { data: null, error: error.message }

    // Update bundle products
    if (validated.product_ids !== undefined) {
      await supabase.from("bundle_products").delete().eq("bundle_id", validated.id)
      if (validated.product_ids.length > 0) {
        await supabase.from("bundle_products").insert(
          validated.product_ids.map(productId => ({
            bundle_id: validated.id,
            product_id: productId
          }))
        )
      }
    }

    revalidatePath("/admin/products")
    return { data, error: null }
  } catch (err: any) {
    return { data: null, error: err?.message ?? "Failed to update bundle" }
  }
}

export async function deleteBundle(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    // Get bundle to delete associated images
    const { data: bundle } = await supabase.from("bundles").select("hero_image_url").eq("id", id).single()

    // Delete bundle
    const { error } = await supabase.from("bundles").delete().eq("id", id)

    if (error) {
      return { error: error.message }
    }

    // Delete associated hero image from storage if exists
    if (bundle?.hero_image_url) {
      await deleteBundleImage(bundle.hero_image_url)
    }

    revalidatePath("/admin/products")
    return { error: null }
  } catch (error) {
    return { error: "Failed to delete bundle" }
  }
}

export async function getBundleProducts(bundleId: string): Promise<{ data: string[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("bundle_products")
      .select("product_id")
      .eq("bundle_id", bundleId)

    if (error) {
      return { data: null, error: error.message }
    }

    const productIds = data.map((item) => item.product_id)
    return { data: productIds, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch bundle products" }
  }
}

// Image management functions
export async function uploadProductImage(file: File, productId?: string): Promise<{ data: { id: string; image_url: string } | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage.from("product-images").upload(fileName, file)

    if (error) {
      return { data: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName)

    // If we have a productId, save to database
    if (productId) {
      const { data: dbData, error: dbError } = await supabase
        .from("product_images")
        .insert([{
          product_id: productId,
          image_url: publicUrl,
          sort_order: 0
        }])
        .select()
        .single()

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from("product-images").remove([fileName])
        return { data: null, error: dbError.message }
      }

      return { 
        data: { 
          id: dbData.id, 
          image_url: publicUrl 
        }, 
        error: null 
      }
    }

    // For new products, just return the URL
    return { 
      data: { 
        id: `temp-${Date.now()}`, 
        image_url: publicUrl 
      }, 
      error: null 
    }
  } catch (error) {
    return { data: null, error: "Failed to upload image" }
  }
}

export async function deleteProductImage(imageId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Get image details before deletion
    const { data: image } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("id", imageId)
      .single()

    if (!image) {
      return { error: "Image not found" }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)

    if (dbError) {
      return { error: dbError.message }
    }

    // Delete from storage
    if (image.image_url) {
      const urlParts = image.image_url.split("/")
      const fileName = urlParts[urlParts.length - 1]
      
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove([fileName])
        
        if (storageError) {
          console.error("Failed to delete image from storage:", storageError)
          // Don't return error as this is not critical for the main operation
        }
      }
    }
    
    return { error: null }
  } catch (error) {
    console.error("Error deleting product image:", error)
    return { error: "Failed to delete image" }
  }
}

export async function deleteBundleImage(imageUrl: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Extract the file path from the URL
    const urlParts = imageUrl.split("/")
    const fileName = urlParts[urlParts.length - 1]
    
    if (fileName) {
      const { error } = await supabase.storage.from("bundle-images").remove([fileName])
      
      if (error) {
        console.error("Failed to delete bundle image from storage:", error)
        // Don't return error as this is not critical for the main operation
      }
    }
    
    return { error: null }
  } catch (error) {
    console.error("Error deleting bundle image:", error)
    return { error: "Failed to delete image" }
  }
}

export async function getProductImages(productId: string): Promise<{ data: Array<{ id: string; image_url: string; caption: string | null; sort_order: number | null }> | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("product_images")
      .select("id, image_url, caption, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: "Failed to fetch product images" }
  }
}
