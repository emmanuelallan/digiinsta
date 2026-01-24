/**
 * Product Enhancement Service
 * 
 * Orchestrates the process of associating taxonomies with products.
 * Provides high-level operations for product enhancement with validation
 * and error handling.
 */

import { ProductTaxonomyRepository, ProductTaxonomyAssociations, EnhancedProduct } from './product-taxonomy-repository';
import { ProductRepository } from './product-repository';

/**
 * Result of an enhancement operation
 */
export interface EnhancementResult {
  success: boolean;
  product?: EnhancedProduct;
  error?: string;
}

/**
 * Service for managing product enhancements
 */
export class ProductEnhancementService {
  private productTaxonomyRepo: ProductTaxonomyRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.productTaxonomyRepo = new ProductTaxonomyRepository();
    this.productRepo = new ProductRepository();
  }

  /**
   * Enhance a product by associating it with taxonomies
   * Validates taxonomy IDs before saving
   */
  async enhanceProduct(
    productId: string,
    associations: ProductTaxonomyAssociations
  ): Promise<EnhancementResult> {
    try {
      // First, verify the product exists
      const product = await this.productRepo.findById(productId);
      if (!product) {
        return {
          success: false,
          error: `Product with ID ${productId} not found`,
        };
      }

      // Validate taxonomy IDs
      const validation = await this.productTaxonomyRepo.validateTaxonomyIds(associations);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid taxonomy IDs: ${validation.errors.join(', ')}`,
        };
      }

      // Update product taxonomies atomically
      await this.productTaxonomyRepo.updateProductTaxonomies(productId, associations);

      // Retrieve the enhanced product with all taxonomies
      const enhancedProduct = await this.productTaxonomyRepo.getProductWithTaxonomies(productId);

      if (!enhancedProduct) {
        return {
          success: false,
          error: 'Failed to retrieve enhanced product',
        };
      }

      return {
        success: true,
        product: enhancedProduct,
      };
    } catch (error) {
      console.error('Error enhancing product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get a product with all its associated taxonomies
   */
  async getProductWithTaxonomies(productId: string): Promise<EnhancedProduct | null> {
    try {
      return await this.productTaxonomyRepo.getProductWithTaxonomies(productId);
    } catch (error) {
      console.error('Error retrieving product with taxonomies:', error);
      return null;
    }
  }

  /**
   * Get all products with their enhancement status
   */
  async getAllProductsWithEnhancementStatus() {
    try {
      return await this.productTaxonomyRepo.getAllProductsWithEnhancementStatus();
    } catch (error) {
      console.error('Error retrieving products with enhancement status:', error);
      return [];
    }
  }
}
