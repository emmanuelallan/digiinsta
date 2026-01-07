"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Timer } from "lucide-react";
import {
  calculateTimeRemaining,
  type TimeRemaining,
} from "@/lib/countdown/calculate-time-remaining";

// Re-export for backwards compatibility
export { calculateTimeRemaining } from "@/lib/countdown/calculate-time-remaining";
export type { TimeRemaining } from "@/lib/countdown/calculate-time-remaining";

interface SaleCountdownProps {
  endDate: Date | string;
  variant?: "badge" | "banner" | "inline";
  className?: string;
  showIcon?: boolean;
  label?: string;
}

/**
 * Format time remaining as a display string
 */
function formatTimeDisplay(time: TimeRemaining): string {
  if (time.isEnded) return "Ended";

  const parts: string[] = [];

  if (time.days > 0) {
    parts.push(`${time.days}d`);
  }
  if (time.hours > 0 || time.days > 0) {
    parts.push(`${time.hours}h`);
  }
  if (time.minutes > 0 || time.hours > 0 || time.days > 0) {
    parts.push(`${time.minutes}m`);
  }
  parts.push(`${time.seconds}s`);

  return parts.join(" ");
}

/**
 * SaleCountdown Component
 * Displays a countdown timer for sale end dates
 * Supports badge, banner, and inline variants
 */
export function SaleCountdown({
  endDate,
  variant = "badge",
  className,
  showIcon = true,
  label = "Sale ends in",
}: SaleCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(endDate)
  );

  const updateCountdown = useCallback(() => {
    setTimeRemaining(calculateTimeRemaining(endDate));
  }, [endDate]);

  useEffect(() => {
    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [updateCountdown]);

  if (timeRemaining.isEnded) {
    if (variant === "badge") {
      return (
        <Badge className={cn("bg-gray-500 text-white hover:bg-gray-600", className)}>
          Sale Ended
        </Badge>
      );
    }
    return null;
  }

  const timeDisplay = formatTimeDisplay(timeRemaining);

  if (variant === "badge") {
    return (
      <Badge className={cn("gap-1 bg-red-500 text-white hover:bg-red-600", className)}>
        {showIcon && <Timer className="h-3 w-3" />}
        {timeDisplay}
      </Badge>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-white",
          className
        )}
      >
        {showIcon && <Clock className="h-4 w-4" />}
        <span className="text-sm font-medium">{label}:</span>
        <div className="flex items-center gap-1 font-mono text-sm font-bold">
          {timeRemaining.days > 0 && (
            <span className="rounded bg-white/20 px-1.5 py-0.5">{timeRemaining.days}d</span>
          )}
          <span className="rounded bg-white/20 px-1.5 py-0.5">
            {String(timeRemaining.hours).padStart(2, "0")}h
          </span>
          <span className="rounded bg-white/20 px-1.5 py-0.5">
            {String(timeRemaining.minutes).padStart(2, "0")}m
          </span>
          <span className="rounded bg-white/20 px-1.5 py-0.5">
            {String(timeRemaining.seconds).padStart(2, "0")}s
          </span>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      {showIcon && <Timer className="h-4 w-4 text-red-500" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-red-500">{timeDisplay}</span>
    </div>
  );
}
