"use client";

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
 * Uses Payload admin styling conventions
 */
export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        {icon && <div className="stat-card__icon">{icon}</div>}
        <span className="stat-card__title">{title}</span>
      </div>
      <div className="stat-card__value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-card__footer">
          {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
          {trend && (
            <span
              className={`stat-card__trend ${trend.isPositive ? "stat-card__trend--positive" : "stat-card__trend--negative"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
