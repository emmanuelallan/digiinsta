"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "use-debounce"
import slugify from "slugify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { productSchema, bundleSchema, type ProductFormInput, type BundleFormInput } from "@/schema/products"
import { upsertProduct, updateProduct, upsertBundle, updateBundle, getBundleProducts, getManagedProducts, getProductImages } from "@/actions/admin/products"
import { getCategories, getSubcategoriesByCategory } from "@/actions/admin/categories"
import type { LemonProduct, Product, Bundle } from "@/types/products"
import type { Tables } from "@/types/supabase"
import { toast } from "sonner"
import { Tag, X, Plus } from "lucide-react"
import { ProductImageUpload } from "@/components/shared/product-image-upload"
import { ProductDescriptionEditor } from "@/components/shared/product-description-editor"

interface ProductFormProps {
  lemonProduct?: LemonProduct
  product?: Product
  bundle?: Bundle
  onSuccess: () => void
  onCancel: () => void
}

type Category = Tables<"categories">
type Subcategory = Tables<"subcategories">

export function ProductForm({ lemonProduct, product, bundle, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [productType, setProductType] = useState<"single" | "bundle">("single")
  const [productImages, setProductImages] = useState<Array<{ id: string; image_url: string; caption?: string | null; sort_order?: number | null }>>([])

  const isEditing = !!(product || bundle)

  // Determine product type based on existing data or lemon product
  useEffect(() => {
    if (bundle) {
      setProductType("bundle")
    } else if (product) {
      setProductType("single")
    } else if (lemonProduct) {
      // You can add logic here to determine if it's a bundle
      // For now, default to single product
      setProductType("single")
    }
  }, [product, bundle, lemonProduct])

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
    } else {
      // Reset images when not editing a product
      setProductImages([])
    }
  }, [product])

  const defaultTitle = product?.title || bundle?.title || lemonProduct?.attributes.name || ""
  const defaultSlug = product?.slug || bundle?.slug || slugify(defaultTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g })

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
      status: (product?.status || "active") as "active" | "draft" | "archived",
      is_physical: product?.is_physical || false,
      tags: product?.tags ?? [],
      details: product?.details || null,
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
          result = await upsertBundle({ ...bundleData, product_ids: selectedProductIds })
        }
      } else {
        const productData = data as ProductFormInput
        // Don't include images in the main form submission - they're handled separately
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images: _, ...productDataWithoutImages } = productData

        if (product) {
          result = await updateProduct({ ...productDataWithoutImages, id: product.id })
        } else {
          result = await upsertProduct(productDataWithoutImages)
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

  const addTag = (tag: string) => {
    const currentTags = productForm.watch("tags") || []
    if (!currentTags.includes(tag)) {
      productForm.setValue("tags", [...currentTags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = productForm.watch("tags") || []
    productForm.setValue("tags", currentTags.filter(tag => tag !== tagToRemove))
  }

  const renderProductForm = () => (
    <form onSubmit={productForm.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
            <Input
              id="title"
              {...productForm.register("title")}
              placeholder="Product title"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {productForm.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{productForm.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</Label>
            <Input
              id="slug"
              {...productForm.register("slug")}
              placeholder="product-slug"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {productForm.formState.errors.slug && (
              <p className="text-sm text-destructive mt-1">{productForm.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
            <ProductDescriptionEditor
              value={productForm.watch("description") || ""}
              onChange={(content) => productForm.setValue("description", content)}
              placeholder="Enter product description..."
            />
            {productForm.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{productForm.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Details (JSON)</Label>
            <Textarea
              id="details"
              placeholder="Enter product details as JSON (e.g., {'color': 'red', 'size': 'large'})"
              rows={4}
              className="px-4 py-3 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              value={productForm.watch("details") ? JSON.stringify(productForm.watch("details"), null, 2) : ""}
              onChange={(e) => {
                try {
                  const parsed = e.target.value ? JSON.parse(e.target.value) : null
                  productForm.setValue("details", parsed)
                } catch {
                  // Invalid JSON, don't set the value
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter additional product details as JSON. This will be stored as structured data.
            </p>
          </div>
        </div>

        {/* Right Column - Settings & Images */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-foreground">Price (cents)</Label>
              <Input
                id="price"
                type="number"
                {...productForm.register("price", { valueAsNumber: true })}
                placeholder="999"
                className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {productForm.formState.errors.price && (
                <p className="text-sm text-destructive mt-1">{productForm.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
              <Select
                value={productForm.watch("status")}
                onValueChange={(value: "active" | "draft" | "archived") => productForm.setValue("status", value)}
              >
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_physical" className="text-sm font-medium text-foreground">Physical Product</Label>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_physical"
                checked={productForm.watch("is_physical")}
                onChange={(e) => productForm.setValue("is_physical", e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="is_physical" className="text-sm">Requires shipping</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Category & Subcategory</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={productForm.watch("subcategory_id") || ""}
                onValueChange={(value) => productForm.setValue("subcategory_id", value || null)}
                disabled={!selectedCategoryId}
              >
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Tags</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        addTag(input.value.trim())
                        input.value = ''
                      }
                    }
                  }}
                  className="flex-1 h-10 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement
                    if (input?.value.trim()) {
                      addTag(input.value.trim())
                      input.value = ''
                    }
                  }}
                  className="h-10 px-4 border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(productForm.watch("tags") || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Full Width - Images */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Product Images</Label>
            <ProductImageUpload
              value={productImages}
              onChange={setProductImages}
              productId={product?.id}
            />
          </div>
        </div>
      </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 px-6 text-sm font-medium border-border bg-background hover:bg-muted/50 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )

  const renderBundleForm = () => (
    <form onSubmit={bundleForm.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bundle-title" className="text-sm font-medium text-foreground">Title</Label>
            <Input
              id="bundle-title"
              {...bundleForm.register("title")}
              placeholder="Bundle title"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {bundleForm.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">{bundleForm.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-slug" className="text-sm font-medium text-foreground">Slug</Label>
            <Input
              id="bundle-slug"
              {...bundleForm.register("slug")}
              placeholder="bundle-slug"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {bundleForm.formState.errors.slug && (
              <p className="text-sm text-destructive mt-1">{bundleForm.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-tagline" className="text-sm font-medium text-foreground">Tagline</Label>
            <Input
              id="bundle-tagline"
              {...bundleForm.register("tagline")}
              placeholder="Short tagline (optional)"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {bundleForm.formState.errors.tagline && (
              <p className="text-sm text-destructive mt-1">{bundleForm.formState.errors.tagline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-description" className="text-sm font-medium text-foreground">Description</Label>
            <ProductDescriptionEditor
              value={bundleForm.watch("description") || ""}
              onChange={(content) => bundleForm.setValue("description", content)}
              placeholder="Enter bundle description..."
            />
            {bundleForm.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{bundleForm.formState.errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Right Column - Settings & Products */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bundle-price" className="text-sm font-medium text-foreground">Price (cents)</Label>
              <Input
                id="bundle-price"
                type="number"
                {...bundleForm.register("price", { valueAsNumber: true })}
                placeholder="999"
                className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {bundleForm.formState.errors.price && (
                <p className="text-sm text-destructive mt-1">{bundleForm.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bundle-status" className="text-sm font-medium text-foreground">Status</Label>
              <Select
                value={bundleForm.watch("status")}
                onValueChange={(value: "active" | "draft" | "archived") => bundleForm.setValue("status", value)}
              >
                <SelectTrigger className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundle-hero-image" className="text-sm font-medium text-foreground">Hero Image</Label>
            <Input
              id="bundle-hero-image"
              {...bundleForm.register("hero_image_url")}
              placeholder="https://example.com/image.jpg"
              className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              URL for the main bundle image (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Products in Bundle</Label>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Select the products that will be included in this bundle
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {availableProducts.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 text-sm p-2 rounded border cursor-pointer hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds([...selectedProductIds, product.id])
                        } else {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== product.id))
                        }
                      }}
                    />
                    <span>{product.title}</span>
                  </label>
                ))}
              </div>
              {availableProducts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No products available for bundle selection
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 px-6 text-sm font-medium border-border bg-background hover:bg-muted/50 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Bundle" : "Create Bundle"}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Product Type Selection */}
      {!isEditing && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">Product Type</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                checked={productType === "single"}
                onChange={() => setProductType("single")}
                className="text-primary"
              />
              <span className="text-sm">Single Product</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="productType"
                checked={productType === "bundle"}
                onChange={() => setProductType("bundle")}
                className="text-primary"
              />
              <span className="text-sm">Bundle</span>
            </label>
          </div>
        </div>
      )}

      {/* Form Content */}
      {productType === "bundle" ? renderBundleForm() : renderProductForm()}
    </div>
  )
}
