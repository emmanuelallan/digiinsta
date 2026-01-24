# Product Images - Custom Upload System

## Overview
The product image system has been updated to **NOT sync images from Lemon Squeezy**. Instead, admins must upload custom high-quality images for each product through the admin panel.

## Why This Change?
- Lemon Squeezy images are often low quality or not optimized for the website
- Custom images provide better control over product presentation
- Allows for consistent branding and image quality across all products
- Enables multiple product images (up to 5) for better product showcase

## How It Works

### 1. Product Sync
When products are synced from Lemon Squeezy:
- Product data (name, description, price) is imported
- **Images array is initialized as empty** `[]`
- Lemon Squeezy's `buy_now_url` is stored for checkout
- Lemon Squeezy images are NOT downloaded or stored

**File**: `lib/products/product-sync-service.ts`

### 2. Admin Image Upload
Admins must upload images for each product:
- Navigate to `/admin/products/[id]`
- Upload up to 5 high-quality images per product
- Images are stored in Cloudflare R2
- Supported formats: JPEG, PNG, WebP
- Max size: 5MB per image

**File**: `app/admin/products/[id]/page.tsx`

### 3. Image Display
Product images are displayed throughout the website:
- Homepage (Best Sellers, New Products)
- Collection pages
- Product detail pages
- Search results

**Placeholder Handling**: If a product has no images, a placeholder icon is shown instead of broken images.

## Image Requirements

### Technical Specs
- **Formats**: JPEG, PNG, WebP
- **Max Size**: 5MB per image
- **Max Count**: 5 images per product
- **Recommended Resolution**: 1200x1200px or higher
- **Aspect Ratio**: 1:1 (square) for best results

### Quality Guidelines
- Use high-resolution images
- Ensure good lighting and clear product visibility
- Maintain consistent style across all product images
- First image is the primary image (shown in listings)
- Additional images shown on hover or in product carousel

## Files Modified

### Core Changes
1. **lib/products/product-sync-service.ts**
   - Removed `fetchProductImages()` call
   - Initialize products with empty images array
   - Updated comments to reflect new behavior

2. **app/admin/products/[id]/page.tsx**
   - Added empty state UI for products without images
   - Added note about custom image requirement
   - Improved image upload UX

### Display Components
3. **components/storefront/homepage/best-sellers.tsx**
   - Added null checks for images
   - Added placeholder SVG for missing images
   - Only show hover effect if secondary image exists

4. **components/storefront/homepage/new-products.tsx**
   - Same updates as best-sellers

5. **app/(storefront)/collections/[slug]/collection-content.tsx**
   - Same updates as best-sellers

6. **components/storefront/shared/product-card.tsx**
   - Already had fallback handling (no changes needed)

## Admin Workflow

### For New Products
1. Sync products from Lemon Squeezy: `/admin/dashboard` → "Sync Products"
2. Products appear with no images
3. Click on each product to edit
4. Upload 5 high-quality images
5. Add taxonomies (Product Type, Format, Occasion, Collection)
6. Save changes

### For Existing Products
1. Navigate to `/admin/products/[id]`
2. Review existing images
3. Delete poor quality images if needed
4. Upload replacement images
5. Ensure at least 1 image is uploaded (preferably 5)

## Lemon Squeezy Integration

### What's Still Used from Lemon Squeezy
- Product name
- Product description (HTML)
- Price and currency
- Buy Now URL (for checkout)
- Product ID (for sync tracking)

### What's NOT Used
- ❌ Thumbnail images (`thumb_url`)
- ❌ Large thumbnail images (`large_thumb_url`)
- ❌ Any product media/assets

## Checkout Flow
During checkout, customers are redirected to Lemon Squeezy's checkout page using the `buy_now_url`. Lemon Squeezy will display their own product images during checkout, which is fine since:
- Checkout is handled by Lemon Squeezy
- Customer has already seen high-quality images on our website
- Lemon Squeezy images are sufficient for payment confirmation

## Migration Notes

### For Existing Products with Lemon Squeezy Images
If you have existing products that were synced with Lemon Squeezy images:
1. Images will remain in the database
2. You can delete them and upload new ones
3. Or keep them if quality is acceptable

### Database Schema
No schema changes required. The `images` column in the `products` table:
- Type: `text[]` (array of strings)
- Stores URLs to images in Cloudflare R2
- Can be empty array `[]`

## Troubleshooting

### Product Shows No Image
**Cause**: No images uploaded for this product
**Solution**: Admin must upload images via `/admin/products/[id]`

### Image Upload Fails
**Possible Causes**:
- File size exceeds 5MB
- Invalid file format
- R2 credentials not configured
- Network error

**Solution**: Check file size/format, verify R2 environment variables

### Images Not Displaying on Website
**Possible Causes**:
- R2 public URL not configured correctly
- CORS issues with R2 bucket
- Image URLs are broken

**Solution**: Verify `R2_PUBLIC_URL` environment variable, check R2 bucket settings

## Environment Variables Required

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=digiinsta
R2_PUBLIC_URL=https://assets.digiinsta.store
```

## Future Enhancements

Potential improvements:
- Bulk image upload for multiple products
- Image optimization/compression on upload
- AI-powered image quality checks
- Automatic image resizing to optimal dimensions
- Image CDN integration for faster loading
