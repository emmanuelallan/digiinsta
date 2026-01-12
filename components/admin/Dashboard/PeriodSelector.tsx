"use client";

import type { TimePeriod } from "@/lib/analytics/types";

export interface PeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-year", label: "This Year" },
];

/**
 * PeriodSelector - Dropdown with period options, triggers data refresh
 * Defaults to "This Month" on initial load
 * Requirements: 2.1, 2.2, 2.4
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as TimePeriod);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="period-select" className="text-muted-foreground text-sm font-medium">
        Time Period
      </label>
      <select
        id="period-select"
        className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
        value={value}
        onChange={handleChange}
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PeriodSelector;
