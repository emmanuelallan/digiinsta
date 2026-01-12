"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/analytics/currency-utils";
import type { ProductPerformance } from "@/lib/analytics/types";

export interface TopProductsTableProps {
  products: ProductPerformance[];
}

/**
 * TopProductsTable - Displays top 5 products with title, units sold, and revenue
 * Requirements: 4.1, 4.2, 4.3
 */
export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No product sales data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 text-right font-medium">Units</th>
                  <th className="pb-3 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product, index) => (
                  <tr key={product.productId} className="text-sm">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="max-w-[180px] truncate font-medium">{product.title}</span>
                        {product.isBundle && (
                          <Badge variant="secondary" className="text-xs">
                            Bundle
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums">{product.unitsSold}</td>
                    <td className="py-3 text-right font-medium tabular-nums">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TopProductsTable;
