// Cart types
export type CartItemType = "product" | "bundle";

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  slug: string;
  quantity: number;
  lsVariantId: string;
}
