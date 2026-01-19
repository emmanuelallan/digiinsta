// Product types
export type ProductStatus = "pending" | "synced" | "failed";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: string;
  compareAtPrice?: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  videoUrl?: string;
  lsProductId?: string;
  lsVariantId?: string;
  syncStatus: ProductStatus;
  syncError?: string;
  lastSyncedAt?: Date;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  deletedAt?: Date;
  viewsCount: number;
  salesCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  price: string;
  priceOverride?: string;
  compareAtPrice?: string;
  shortDescription?: string;
  description: string;
  imageUrl?: string;
  lsProductId?: string;
  lsVariantId?: string;
  syncStatus: ProductStatus;
  syncError?: string;
  lastSyncedAt?: Date;
  isFeatured: boolean;
  isActive: boolean;
  deletedAt?: Date;
  viewsCount: number;
  salesCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}
