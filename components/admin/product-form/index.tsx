"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "use-debounce"
import slugify from "slugify"
import { productSchema, bundleSchema, type ProductFormInput, type BundleFormInput } from "@/schema/products"
import { upsertProduct, updateProduct, upsertBundle, updateBundle, getBundleProducts, getManagedProducts, getProductImages } from "@/actions/admin/products"
import { getCategories, getSubcategoriesByCategory } from "@/actions/admin/categories"
import type { LemonProduct, Product, Bundle } from "@/types/products"
import type { Tables } from "@/types/supabase"
import { toast } from "sonner"
import { ProductFormFields } from "./product-form-fields"
import { BundleFormFields } from "./bundle-form-fields"
import { createClient } from "@/lib/supabase/server"
import { uploadProductImage } from "@/actions/admin/products"

interface ProductFormProps {
  lemonProduct?: LemonProduct
  product?: Product
  bundle?: Bundle
  onSuccess: () => void
  onCancel: () => void
  defaultProductType?: "single" | "bundle"
}

type Category = Tables<"categories">
type Subcategory = Tables<"subcategories">

export function ProductForm({ lemonProduct, product, bundle, onSuccess, onCancel, defaultProductType = "single" }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productType, setProductType] = useState<"single" | "bundle">(defaultProductType)
  const [productImages, setProductImages] = useState<Array<{ id: string; image_url: string; caption?: string | null; sort_order?: number | null }>>([])

  const isEditing = !!(product || bundle)

  // Determine product type based on existing data or lemon product
  useEffect(() => {
    if (bundle) {
      setProductType("bundle")
    } else if (product) {
      setProductType("single")
    } else if (lemonProduct) {
      // Use the defaultProductType for new products from Lemon Squeezy
      setProductType(defaultProductType)
    }
  }, [product, bundle, lemonProduct, defaultProductType])

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await getCategories()
      if (data) {
        setCategories(data)
        
        // If editing a product with a subcategory, find and set the parent category
        if (product?.subcategory_id) {
          // Find the parent category by checking each category's subcategories
          for (const category of data) {
            const { data: subs } = await getSubcategoriesByCategory(category.id)
            if (subs && subs.some(sub => sub.id === product.subcategory_id)) {
              setSelectedCategoryId(category.id)
              break
            }
          }
        }
      }
    }
    fetchCategories()
  }, [product?.subcategory_id])

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const fetchSubcategories = async () => {
        const { data } = await getSubcategoriesByCategory(selectedCategoryId)
        if (data) {
          setSubcategories(data)
        }
      }
      fetchSubcategories()
    } else {
      setSubcategories([])
    }
  }, [selectedCategoryId])

  // Fetch available products for bundle selection
  useEffect(() => {
    if (productType === "bundle") {
      const fetchProducts = async () => {
        const { data } = await getManagedProducts()
        if (data) {
          setAvailableProducts(data)
        }
      }
      fetchProducts()
    }
  }, [productType])

  // Load bundle products if editing
  useEffect(() => {
    if (bundle) {
      const loadBundleProducts = async () => {
        const { data } = await getBundleProducts(bundle.id)
        if (data) {
          setSelectedProductIds(data)
        }
      }
      loadBundleProducts()
    }
  }, [bundle])

  // Initialize product images when editing
  useEffect(() => {
    if (product?.id) {
      // Use images already loaded with the product if available
      if (product.images && product.images.length > 0) {
        setProductImages(product.images)
      } else {
        // Always fetch images to ensure we have the latest data
        const loadProductImages = async () => {
          const { data } = await getProductImages(product.id)
          if (data) {
            setProductImages(data)
          } else {
            // If no images found, set empty array
            setProductImages([])
          }
        }
        loadProductImages()
      }
    } else if (lemonProduct && !product && !bundle) {
      // For new products from Lemon Squeezy, automatically add their thumbnail
      if (lemonProduct.attributes.thumb_url) {
        // Use the handleLemonSqueezyImage function to properly handle the image
        handleLemonSqueezyImage(lemonProduct.attributes.thumb_url).then((imageData) => {
          if (imageData) {
            setProductImages([{
              id: imageData.id,
              image_url: imageData.image_url,
              caption: `Thumbnail from ${lemonProduct.attributes.name}`,
              sort_order: 0
            }])
          }
        }).catch(() => {
          // Fallback to direct URL if image handling fails
          setProductImages([{
            id: `temp-lemon-${Date.now()}`,
            image_url: lemonProduct.attributes.thumb_url,
            caption: `Thumbnail from ${lemonProduct.attributes.name}`,
            sort_order: 0
          }])
        })
      } else {
        setProductImages([])
      }
    } else {
      // Reset images when not editing a product
      setProductImages([])
    }
  }, [product, lemonProduct, bundle])

  const defaultTitle = product?.title || bundle?.title || lemonProduct?.attributes.name || ""
  const defaultSlug = product?.slug || bundle?.slug || slugify(defaultTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })
  
  // Extract additional metadata from Lemon Squeezy product
  const extractLemonMetadata = () => {
    if (!lemonProduct) return {}
    
    const metadata: Record<string, unknown> = {}
    
    // Extract tags from description or other fields if available
    if (lemonProduct.attributes.description) {
      // Try to extract tags from description (common patterns)
      const desc = lemonProduct.attributes.description.toLowerCase()
      const potentialTags = []
      
      // Look for common tag patterns
      if (desc.includes('digital') || desc.includes('download') || desc.includes('instant')) potentialTags.push('digital')
      if (desc.includes('physical') || desc.includes('shipping') || desc.includes('delivery') || desc.includes('mail')) potentialTags.push('physical')
      if (desc.includes('course') || desc.includes('training') || desc.includes('tutorial') || desc.includes('lesson')) potentialTags.push('course')
      if (desc.includes('template') || desc.includes('resource') || desc.includes('kit') || desc.includes('pack')) potentialTags.push('template')
      if (desc.includes('software') || desc.includes('tool') || desc.includes('app') || desc.includes('plugin')) potentialTags.push('software')
      if (desc.includes('ebook') || desc.includes('book') || desc.includes('guide') || desc.includes('manual')) potentialTags.push('ebook')
      if (desc.includes('video') || desc.includes('streaming') || desc.includes('webinar')) potentialTags.push('video')
      if (desc.includes('audio') || desc.includes('podcast') || desc.includes('music')) potentialTags.push('audio')
      
      if (potentialTags.length > 0) {
        metadata.tags = potentialTags
      }
    }
    
    // Determine if it's physical based on description and price
    if (lemonProduct.attributes.description) {
      const desc = lemonProduct.attributes.description.toLowerCase()
      metadata.is_physical = desc.includes('physical') || desc.includes('shipping') || desc.includes('delivery') || desc.includes('mail')
    }
    
    // Set default status based on Lemon Squeezy status
    if (lemonProduct.attributes.status === 'published') {
      metadata.status = 'active'
    } else if (lemonProduct.attributes.status === 'draft') {
      metadata.status = 'draft'
    } else {
      metadata.status = 'active'
    }
    
    // Extract additional details
    metadata.details = {
      lemon_squeezy_id: lemonProduct.id,
      store_id: lemonProduct.attributes.store_id,
      status: lemonProduct.attributes.status,
      test_mode: lemonProduct.attributes.test_mode,
      pay_what_you_want: lemonProduct.attributes.pay_what_you_want,
      created_at: lemonProduct.attributes.created_at,
      updated_at: lemonProduct.attributes.updated_at,
      thumb_url: lemonProduct.attributes.thumb_url,
      large_thumb_url: lemonProduct.attributes.large_thumb_url,
      buy_now_url: lemonProduct.attributes.buy_now_url
    }
    
    return metadata
  }

  // Function to handle Lemon Squeezy images properly
  const handleLemonSqueezyImage = async (imageUrl: string, productId?: string) => {
    try {
      // Download the image from Lemon Squeezy
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Failed to download image')
      
      const blob = await response.blob()
      const file = new File([blob], `lemon-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // Upload to our storage
      const { data, error } = await uploadProductImage(file, productId)
      
      if (error) throw new Error(error)
      
      return data
    } catch (error) {
      console.error('Failed to handle Lemon Squeezy image:', error)
      // Fallback to using the URL directly
      return {
        id: `temp-lemon-${Date.now()}`,
        image_url: imageUrl
      }
    }
  }



  const lemonMetadata = extractLemonMetadata()

  const productForm = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lemon_product_id: product?.lemon_product_id || lemonProduct?.id || "",
      lemon_variant_id: product?.lemon_variant_id || lemonProduct?.id || "",
      subcategory_id: product?.subcategory_id || null,
      title: defaultTitle,
      slug: defaultSlug,
      description: product?.description || lemonProduct?.attributes.description || "",
      price: product?.price ?? lemonProduct?.attributes.price ?? null,
      status: (product?.status || lemonMetadata.status || "active") as "active" | "draft" | "archived",
      is_physical: product?.is_physical ?? (lemonMetadata.is_physical as boolean) ?? false,
      tags: product?.tags ?? (lemonMetadata.tags as string[]) ?? [],
      details: product?.details || lemonMetadata.details || null,
    },
  })

  const bundleForm = useForm<BundleFormInput>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      lemon_product_id: bundle?.lemon_product_id || lemonProduct?.id || "",
      lemon_variant_id: bundle?.lemon_variant_id || lemonProduct?.id || "",
      title: defaultTitle,
      slug: defaultSlug,
      tagline: bundle?.tagline || "",
      description: bundle?.description || lemonProduct?.attributes.description || "",
      price: bundle?.price ?? lemonProduct?.attributes.price ?? null,
      status: (bundle?.status || "active") as "active" | "draft" | "archived",
      hero_image_url: bundle?.hero_image_url || "",
      product_ids: bundle?.id ? [] : [],
    },
  })

  // Set hero image for new bundles from Lemon Squeezy
  useEffect(() => {
    if (lemonProduct && !bundle && !product && productType === "bundle") {
      if (lemonProduct.attributes.large_thumb_url || lemonProduct.attributes.thumb_url) {
        const imageUrl = lemonProduct.attributes.large_thumb_url || lemonProduct.attributes.thumb_url
        if (imageUrl) {
          bundleForm.setValue("hero_image_url", imageUrl)
        }
      }
    }
  }, [lemonProduct, bundle, product, productType, bundleForm])

  const watchedTitle = productType === "bundle" ? bundleForm.watch("title") : productForm.watch("title")
  const [debouncedTitle] = useDebounce(watchedTitle, 300)

  // Auto-generate slug from title
  useEffect(() => {
    if (debouncedTitle && !isEditing) {
      const generatedSlug = slugify(debouncedTitle, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      })
      if (productType === "bundle") {
        bundleForm.setValue("slug", generatedSlug)
      } else {
        productForm.setValue("slug", generatedSlug)
      }
    }
  }, [debouncedTitle, isEditing, productType, productForm, bundleForm])

  const handleSubmit = async (data: ProductFormInput | BundleFormInput) => {
    setIsSubmitting(true)

    try {
      let result

      if (productType === "bundle") {
        const bundleData = data as BundleFormInput
        if (bundle) {
          result = await updateBundle({ ...bundleData, id: bundle.id, product_ids: selectedProductIds })
        } else {
          // For new bundles, handle the hero image if it's from Lemon Squeezy
          let finalHeroImageUrl = bundleData.hero_image_url
          if (bundleData.hero_image_url && lemonProduct) {
            // If this is a Lemon Squeezy image, we might want to handle it specially
            // For now, just use the URL directly
            finalHeroImageUrl = bundleData.hero_image_url
          }
          
          result = await upsertBundle({ 
            ...bundleData, 
            hero_image_url: finalHeroImageUrl,
            product_ids: selectedProductIds 
          })
        }
      } else {
        const productData = data as ProductFormInput
        // Don't include images in the main form submission - they're handled separately
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images: _, ...productDataWithoutImages } = productData

        if (product) {
          result = await updateProduct({ ...productDataWithoutImages, id: product.id })
        } else {
          // For new products, create the product first
          result = await upsertProduct(productDataWithoutImages)
          
          // If product was created successfully and we have images, update them with the real product ID
          if (result.data && productImages.length > 0) {
            const supabase = await createClient()
            
            // Update all temporary images with the real product ID
            for (const image of productImages) {
              if (image.id.startsWith('temp-')) {
                // This is a temporary image, we need to create a proper database record
                const { error: imageError } = await supabase
                  .from("product_images")
                  .insert([{
                    product_id: result.data.id,
                    image_url: image.image_url,
                    caption: image.caption,
                    sort_order: image.sort_order || 0
                  }])
                
                if (imageError) {
                  console.error("Failed to save image:", imageError)
                }
              }
            }
          }
        }
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`${productType === "bundle" ? "Bundle" : "Product"} ${isEditing ? "updated" : "created"} successfully`)
      onSuccess()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Content */}
      {productType === "bundle" ? (
        <BundleFormFields
          form={bundleForm}
          availableProducts={availableProducts}
          selectedProductIds={selectedProductIds}
          setSelectedProductIds={setSelectedProductIds}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />
      ) : (
        <ProductFormFields
          form={productForm}
          categories={categories}
          subcategories={subcategories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          productImages={productImages}
          setProductImages={setProductImages}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          product={product}
        />
      )}
    </div>
  )
}
