/**
 * Date Range Utilities
 * Functions for calculating date ranges based on time periods
 */

import type { DateRange, TimePeriod } from "./types";

/**
 * Get the date range for a given time period
 * All ranges are calculated relative to the current date
 *
 * @param period - The time period to calculate the range for
 * @param referenceDate - Optional reference date (defaults to now, useful for testing)
 * @returns DateRange with start and end dates
 */
export function getDateRangeForPeriod(
  period: TimePeriod,
  referenceDate: Date = new Date(),
): DateRange {
  const now = new Date(referenceDate);

  switch (period) {
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }

    case "last-month": {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }

    case "last-7-days": {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }

    case "last-30-days": {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }

    case "this-year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
  }
}

/**
 * Format a date range for display
 *
 * @param range - The date range to format
 * @returns Formatted string like "Jan 1 - Jan 31, 2026"
 */
export function formatDateRange(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const startStr = range.start.toLocaleDateString("en-US", options);
  const endStr = range.end.toLocaleDateString("en-US", {
    ...options,
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Check if a date falls within a date range (inclusive)
 *
 * @param date - The date to check
 * @param range - The date range to check against
 * @returns true if the date is within the range
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

/**
 * All available time periods for iteration
 */
export const ALL_TIME_PERIODS: TimePeriod[] = [
  "this-month",
  "last-month",
  "last-7-days",
  "last-30-days",
  "this-year",
];
