"use client";

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
export function GoalProgressCard({
  partners,
  goalAmount,
}: GoalProgressCardProps) {
  const formattedGoal = formatCurrency(goalAmount);

  return (
    <div className="goal-progress-card">
      <div className="goal-progress-card__header">
        <h3 className="goal-progress-card__title">Partner Revenue Goals</h3>
        <span className="goal-progress-card__goal">
          Goal: {formattedGoal}/month
        </span>
      </div>

      {partners.length === 0 ? (
        <div className="goal-progress-card__empty">
          No partner revenue data available
        </div>
      ) : (
        <div className="goal-progress-card__list">
          {partners.map((partner) => (
            <div key={partner.userId} className="goal-progress-card__partner">
              <div className="goal-progress-card__partner-info">
                <span className="goal-progress-card__partner-name">
                  {partner.name || partner.email}
                </span>
                <span className="goal-progress-card__partner-amount">
                  {formatCurrency(partner.amount)} (
                  {partner.goalProgress.toFixed(0)}%)
                </span>
              </div>
              <div className="goal-progress-card__progress-bar">
                <div
                  className="goal-progress-card__progress-fill"
                  style={{ width: `${Math.min(partner.goalProgress, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GoalProgressCard;
