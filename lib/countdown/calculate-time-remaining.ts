/**
 * Time remaining calculation utility
 * Separated from React component for testability
 */

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

/**
 * Calculate time remaining until end date
 * @param endDate - The sale end date
 * @returns TimeRemaining object with days, hours, minutes, seconds, and isEnded flag
 */
export function calculateTimeRemaining(endDate: Date | string): TimeRemaining {
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isEnded: false };
}
