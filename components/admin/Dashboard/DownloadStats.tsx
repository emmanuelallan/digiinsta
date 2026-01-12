"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../shared/StatCard";
import type { DownloadStats as DownloadStatsType } from "@/lib/analytics/types";

export interface DownloadStatsProps {
  downloads: DownloadStatsType;
}

/**
 * DownloadStats - Displays total downloads and average per order
 * Requirements: 6.1, 6.2, 6.3
 */
export function DownloadStats({ downloads }: DownloadStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Download Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="Total Downloads"
            value={downloads.totalDownloads.toLocaleString()}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          />
          <StatCard
            title="Avg per Order"
            value={downloads.averagePerOrder.toFixed(1)}
            subtitle="downloads"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
          />
        </div>

        {downloads.byProduct.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-medium">Downloads by Product</h4>
            <ul className="divide-y">
              {downloads.byProduct.slice(0, 5).map((product) => (
                <li key={product.productId} className="flex items-center justify-between py-2">
                  <span className="max-w-[250px] truncate text-sm">{product.title}</span>
                  <span className="text-sm font-medium tabular-nums">
                    {product.downloads.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DownloadStats;
