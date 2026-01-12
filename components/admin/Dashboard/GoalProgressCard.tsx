"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/analytics/currency-utils";
import type { PartnerRevenue } from "@/lib/analytics/types";

export interface GoalProgressCardProps {
  partners: PartnerRevenue[];
  goalAmount: number; // Goal in cents (e.g., 40000 = $400)
}

/**
 * GoalProgressCard - Displays partner breakdown with progress bars toward $400 goal
 * Requirements: 1.2, 1.3
 */
export function GoalProgressCard({ partners, goalAmount }: GoalProgressCardProps) {
  const formattedGoal = formatCurrency(goalAmount);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Partner Revenue Goals
          </CardTitle>
          <span className="text-muted-foreground text-xs">Goal: {formattedGoal}/month</span>
        </div>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No partner revenue data available
          </p>
        ) : (
          <div className="space-y-4">
            {partners.map((partner) => (
              <div key={partner.userId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="max-w-[150px] truncate font-medium">
                    {partner.name || partner.email}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(partner.amount)} ({partner.goalProgress.toFixed(0)}%)
                  </span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(partner.goalProgress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GoalProgressCard;
