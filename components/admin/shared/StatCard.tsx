"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

/**
 * StatCard - Reusable statistics card component for the admin dashboard
 * Uses Tailwind CSS and shadcn/ui Card component
 */
export function StatCard({ title, value, subtitle, trend, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trend) && (
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
