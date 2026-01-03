"use client";

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
    <div className="top-products-table">
      <div className="top-products-table__header">
        <h3 className="top-products-table__title">Top Products</h3>
      </div>

      {products.length === 0 ? (
        <div className="top-products-table__empty">
          No product sales data available
        </div>
      ) : (
        <table className="top-products-table__table">
          <thead>
            <tr>
              <th className="top-products-table__th">Product</th>
              <th className="top-products-table__th top-products-table__th--right">
                Units
              </th>
              <th className="top-products-table__th top-products-table__th--right">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.productId} className="top-products-table__row">
                <td className="top-products-table__td">
                  <div className="top-products-table__product">
                    <span className="top-products-table__rank">
                      {index + 1}
                    </span>
                    <span className="top-products-table__product-title">
                      {product.title}
                      {product.isBundle && (
                        <span className="top-products-table__bundle-badge">
                          Bundle
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="top-products-table__td top-products-table__td--right">
                  {product.unitsSold}
                </td>
                <td className="top-products-table__td top-products-table__td--right">
                  {formatCurrency(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TopProductsTable;
