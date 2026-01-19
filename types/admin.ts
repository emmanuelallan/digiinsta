// Admin types
export interface Order {
  id: string;
  lsOrderId?: string;
  customerEmail: string;
  customerName?: string;
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  fulfillmentStatus: "pending" | "fulfilled" | "failed";
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  bundleId?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  productSnapshot: Record<string, unknown>;
  createdAt: Date;
}
