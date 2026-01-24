/**
 * Product Sync Service
 * 
 * Orchestrates the synchronization of products from Lemon Squeezy API
 * to the local database. Handles duplicate detection and sync result tracking.
 */

import { LemonSqueezyClient, LemonSqueezyApiError } from '@/lib/lemon-squeezy';
import { ProductRepository } from './product-repository';
import type { LemonSqueezyProduct } from '@/lib/lemon-squeezy';

/**
 * Result of a product sync operation
 */
export interface SyncResult {
  success: boolean;
  newProductsCount: number;
  skippedProductsCount: number;
  errors: string[];
}

/**
 * Service for synchronizing products from Lemon Squeezy
 */
export class ProductSyncService {
  private lemonSqueezyClient: LemonSqueezyClient;
  private productRepository: ProductRepository;

  constructor(
    lemonSqueezyClient?: LemonSqueezyClient,
    productRepository?: ProductRepository
  ) {
    this.lemonSqueezyClient = lemonSqueezyClient || new LemonSqueezyClient();
    this.productRepository = productRepository || new ProductRepository();
  }

  /**
   * Sync all products from Lemon Squeezy API to the database
   * 
   * This method:
   * 1. Fetches all products from Lemon Squeezy API
   * 2. Checks for duplicates using Lemon Squeezy ID
   * 3. Inserts new products with empty images array (admin will upload custom images)
   * 4. Skips existing products
   * 5. Returns a summary of the sync operation
   * 
   * Note: Product images are NOT synced from Lemon Squeezy.
   * Admins must upload custom high-quality images via the admin panel.
   */
  async syncProducts(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      newProductsCount: 0,
      skippedProductsCount: 0,
      errors: [],
    };

    try {
      // Fetch all products from Lemon Squeezy API
      const lsProducts = await this.lemonSqueezyClient.fetchAllProducts();

      // Process each product
      for (const lsProduct of lsProducts) {
        try {
          await this.syncSingleProduct(lsProduct, result);
        } catch (error) {
          // Log error for this product but continue with others
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(
            `Failed to sync product "${lsProduct.attributes.name}" (ID: ${lsProduct.id}): ${errorMessage}`
          );
        }
      }

      // If there were any errors, mark the sync as partially failed
      if (result.errors.length > 0) {
        result.success = false;
      }

      return result;
    } catch (error) {
      // Handle fatal errors that prevent the entire sync
      if (error instanceof LemonSqueezyApiError) {
        result.success = false;
        result.errors.push(`Lemon Squeezy API Error: ${error.message}`);
        if (error.details) {
          result.errors.push(`Details: ${error.details}`);
        }
      } else {
        result.success = false;
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Sync failed: ${errorMessage}`);
      }

      return result;
    }
  }

  /**
   * Sync a single product from Lemon Squeezy
   * Handles duplicate detection
   * Note: Images are NOT synced from Lemon Squeezy - admins must upload custom images
   */
  private async syncSingleProduct(
    lsProduct: LemonSqueezyProduct,
    result: SyncResult
  ): Promise<void> {
    // Check if product already exists (duplicate detection)
    const existingProduct = await this.productRepository.findByLemonSqueezyId(
      lsProduct.id
    );

    if (existingProduct) {
      // Product already exists, skip insertion
      result.skippedProductsCount++;
      return;
    }

    // Extract currency from price_formatted (e.g., "$10.00" -> "USD")
    // Default to USD if we can't determine the currency
    const currency = this.extractCurrency(lsProduct.attributes.price_formatted);

    // Convert price from cents to dollars
    // Lemon Squeezy API returns prices in cents (e.g., 2999 = $29.99)
    const priceInDollars = lsProduct.attributes.price / 100;

    // Create new product in database with empty images array
    // Admin will upload custom images via the admin panel
    await this.productRepository.createProduct({
      lemonSqueezyId: lsProduct.id,
      name: lsProduct.attributes.name,
      description: lsProduct.attributes.description || null,
      price: priceInDollars,
      currency: currency,
      images: [], // Empty array - admin will upload custom images
      buyNowUrl: lsProduct.attributes.buy_now_url,
    });

    result.newProductsCount++;
  }

  /**
   * Extract currency code from formatted price string
   * This is a simple heuristic - in production, you might want to use
   * the store's default currency or fetch it from the API
   */
  private extractCurrency(priceFormatted: string): string {
    // Common currency symbols
    if (priceFormatted.includes('$')) return 'USD';
    if (priceFormatted.includes('€')) return 'EUR';
    if (priceFormatted.includes('£')) return 'GBP';
    if (priceFormatted.includes('¥')) return 'JPY';
    
    // Default to USD
    return 'USD';
  }
}
