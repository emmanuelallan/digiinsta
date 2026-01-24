'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/image-carousel';
import { TaxonomySelector, TaxonomyOption } from '@/components/taxonomy-selector';
import { TaxonomyDialog, SimpleTaxonomyInput, ComplexTaxonomyInput } from '@/components/taxonomy-dialog';
import { Breadcrumb } from '@/components/breadcrumb';
import { useTaxonomyCache } from '@/lib/taxonomies/use-taxonomy-cache';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  lemonSqueezyId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  productType?: {
    id: string;
    title: string;
  } | null;
  formats: Array<{
    id: string;
    title: string;
  }>;
  occasion?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  } | null;
  collection?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
  } | null;
  isEnhanced: boolean;
}

type TaxonomyType = 'product_type' | 'format' | 'occasion' | 'collection';

interface DialogState {
  isOpen: boolean;
  type: TaxonomyType | null;
}

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [productId, setProductId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Use taxonomy cache hook
  const { fetchAllTaxonomies, addToCache } = useTaxonomyCache();

  // Taxonomy selections
  const [productTypeId, setProductTypeId] = useState<string>('');
  const [formatIds, setFormatIds] = useState<string[]>([]);
  const [occasionId, setOccasionId] = useState<string>('');
  const [collectionId, setCollectionId] = useState<string>('');

  // Taxonomy options
  const [productTypes, setProductTypes] = useState<TaxonomyOption[]>([]);
  const [formats, setFormats] = useState<TaxonomyOption[]>([]);
  const [occasions, setOccasions] = useState<TaxonomyOption[]>([]);
  const [collections, setCollections] = useState<TaxonomyOption[]>([]);

  // Dialog state
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: null,
  });

  // Unwrap params
  useEffect(() => {
    params.then((p) => setProductId(p.id));
  }, [params]);

  // Fetch product data
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        // Use enhanced endpoint to get full taxonomy data
        const response = await fetch(`/api/products/${productId}/enhanced`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
          
          // Set initial selections
          setProductTypeId(data.product.productType?.id || '');
          setFormatIds(data.product.formats?.map((f: { id: string; title: string }) => f.id) || []);
          setOccasionId(data.product.occasion?.id || '');
          setCollectionId(data.product.collection?.id || '');
        } else {
          toast.error('Failed to load product');
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('An error occurred while loading the product');
        router.push('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // Fetch all taxonomies using cache
  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const taxonomies = await fetchAllTaxonomies();
        setProductTypes(taxonomies.productTypes);
        setFormats(taxonomies.formats);
        setOccasions(taxonomies.occasions);
        setCollections(taxonomies.collections);
      } catch (error) {
        console.error('Error fetching taxonomies:', error);
        toast.error('Failed to load taxonomy options');
      }
    };

    loadTaxonomies();
  }, [fetchAllTaxonomies]);

  // Handle opening taxonomy dialog
  const handleOpenDialog = (type: TaxonomyType) => {
    setDialogState({ isOpen: true, type });
  };

  // Handle closing taxonomy dialog
  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, type: null });
  };

  // Handle saving new taxonomy
  const handleSaveTaxonomy = async (data: SimpleTaxonomyInput | ComplexTaxonomyInput) => {
    if (!dialogState.type) return;

    try {
      const type = dialogState.type;
      let response;

      // Determine endpoint and prepare request
      if (type === 'product_type') {
        response = await fetch('/api/taxonomies/product-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: (data as SimpleTaxonomyInput).title }),
        });
      } else if (type === 'format') {
        response = await fetch('/api/taxonomies/formats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: (data as SimpleTaxonomyInput).title }),
        });
      } else if (type === 'occasion') {
        const formData = new FormData();
        const complexData = data as ComplexTaxonomyInput;
        formData.append('title', complexData.title);
        formData.append('description', complexData.description);
        formData.append('image', complexData.image);

        response = await fetch('/api/taxonomies/occasions', {
          method: 'POST',
          body: formData,
        });
      } else if (type === 'collection') {
        const formData = new FormData();
        const complexData = data as ComplexTaxonomyInput;
        formData.append('title', complexData.title);
        formData.append('description', complexData.description);
        formData.append('image', complexData.image);

        response = await fetch('/api/taxonomies/collections', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response) {
        throw new Error('Failed to create taxonomy');
      }

      const result = await response.json();

      if (result.success) {
        // Get the created taxonomy
        const newTaxonomy = result.productType || result.format || result.occasion || result.collection;

        // Update the appropriate taxonomy list and cache
        if (type === 'product_type') {
          setProductTypes((prev) => [...prev, newTaxonomy]);
          setProductTypeId(newTaxonomy.id);
          addToCache('product_type', newTaxonomy);
        } else if (type === 'format') {
          setFormats((prev) => [...prev, newTaxonomy]);
          setFormatIds((prev) => [...prev, newTaxonomy.id]);
          addToCache('format', newTaxonomy);
        } else if (type === 'occasion') {
          setOccasions((prev) => [...prev, newTaxonomy]);
          setOccasionId(newTaxonomy.id);
          addToCache('occasion', newTaxonomy);
        } else if (type === 'collection') {
          setCollections((prev) => [...prev, newTaxonomy]);
          setCollectionId(newTaxonomy.id);
          addToCache('collection', newTaxonomy);
        }

        toast.success(`${type.replace('_', ' ')} created successfully`);
      } else {
        throw new Error(result.error || 'Failed to create taxonomy');
      }
    } catch (error) {
      console.error('Error creating taxonomy:', error);
      throw error; // Re-throw to let dialog handle it
    }
  };

  // Handle saving product enhancements
  const handleSave = async () => {
    if (!productId) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}/enhance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTypeId: productTypeId || null,
          formatIds: formatIds.length > 0 ? formatIds : [],
          occasionId: occasionId || null,
          collectionId: collectionId || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product enhanced successfully!');
        
        // Reload product data from server to get fresh taxonomy associations
        const productResponse = await fetch(`/api/products/${productId}/enhanced`);
        const productData = await productResponse.json();

        if (productData.success && productData.product) {
          // Update product state
          setProduct(productData.product);
          
          // Update taxonomy selections from fresh data
          setProductTypeId(productData.product.productType?.id || '');
          setFormatIds(productData.product.formats?.map((f: { id: string }) => f.id) || []);
          setOccasionId(productData.product.occasion?.id || '');
          setCollectionId(productData.product.collection?.id || '');
        }
      } else {
        toast.error(data.error || 'Failed to save product enhancements');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !productId) return;

    // Check if adding these files would exceed the limit
    const currentImageCount = product?.images.length || 0;
    const newImageCount = files.length;
    const totalCount = currentImageCount + newImageCount;

    if (totalCount > 5) {
      toast.error(`Cannot upload ${newImageCount} images. Maximum 5 images allowed (currently ${currentImageCount}).`);
      e.target.value = ''; // Reset input
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${data.uploadedCount} image(s) uploaded successfully!`);
        
        // Update product images
        if (product) {
          setProduct({
            ...product,
            images: data.images,
          });
        }

        // Show warnings if any uploads failed
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error: string) => toast.warning(error));
        }
      } else {
        toast.error(data.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('An error occurred while uploading images');
    } finally {
      setIsSaving(false);
      e.target.value = ''; // Reset input
    }
  };

  // Handle image delete
  const handleImageDelete = async (imageUrl: string) => {
    if (!productId) return;

    const confirmed = confirm('Are you sure you want to delete this image?');
    if (!confirmed) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Image deleted successfully!');
        
        // Update product images
        if (product) {
          setProduct({
            ...product,
            images: data.images,
          });
        }
      } else {
        toast.error(data.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('An error occurred while deleting image');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: product.name }
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground mt-1">{formattedPrice}</p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Product Enhancement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Product Images</h3>
                <span className="text-xs text-muted-foreground">
                  {product.images.length} / 5 images
                </span>
              </div>
              <ImageCarousel images={product.images} alt={product.name} />
              
              {/* Image Upload */}
              {product.images.length < 5 && (
                <div className="mt-4">
                  <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                    Add More Images (max 5 total)
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isSaving}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Allowed formats: JPEG, PNG, WebP. Max size: 5MB per image.
                  </p>
                </div>
              )}

              {/* Image Management */}
              {product.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Manage Images</p>
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(imageUrl)}
                          disabled={isSaving}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          aria-label={`Delete image ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Description */}
            {product.description && (
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <div 
                  className="text-sm text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Taxonomy Selectors */}
            <fieldset className="space-y-4 pt-4 border-t">
              <legend className="text-lg font-semibold">Taxonomies</legend>

              {/* Product Type */}
              <TaxonomySelector
                type="product_type"
                label="Product Type"
                value={productTypeId}
                onChange={(value) => setProductTypeId(value as string)}
                options={productTypes}
                onAddNew={() => handleOpenDialog('product_type')}
              />

              {/* Formats */}
              <TaxonomySelector
                type="format"
                label="Formats"
                value={formatIds}
                onChange={(value) => setFormatIds(value as string[])}
                options={formats}
                multiple
                onAddNew={() => handleOpenDialog('format')}
              />

              {/* Occasion */}
              <TaxonomySelector
                type="occasion"
                label="Occasion"
                value={occasionId}
                onChange={(value) => setOccasionId(value as string)}
                options={occasions}
                onAddNew={() => handleOpenDialog('occasion')}
              />

              {/* Collection */}
              <TaxonomySelector
                type="collection"
                label="Collection"
                value={collectionId}
                onChange={(value) => setCollectionId(value as string)}
                options={collections}
                onAddNew={() => handleOpenDialog('collection')}
              />
            </fieldset>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                aria-label="Save product enhancements"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxonomy Dialog */}
      {dialogState.type && (
        <TaxonomyDialog
          type={dialogState.type}
          isOpen={dialogState.isOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveTaxonomy}
        />
      )}
    </div>
  );
}
