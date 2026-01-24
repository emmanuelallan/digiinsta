/**
 * Products Module
 * 
 * Exports product-related services and repositories
 */

export { ProductRepository } from './product-repository';
export { ProductSyncService } from './product-sync-service';
export { ProductEnhancementService } from './product-enhancement-service';
export { ProductTaxonomyRepository } from './product-taxonomy-repository';
export { 
  uploadProductImage, 
  uploadProductImages, 
  deleteProductImage, 
  deleteProductImages,
  validateProductImage 
} from './product-image-service';
export type { Product, CreateProductInput } from './product-repository';
export type { SyncResult } from './product-sync-service';
export type { 
  EnhancedProduct, 
  ProductTaxonomyAssociations 
} from './product-taxonomy-repository';
export type { EnhancementResult } from './product-enhancement-service';
