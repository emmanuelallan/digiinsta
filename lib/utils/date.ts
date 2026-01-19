// Date formatting - placeholder
import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: Date | string) {
  return format(new Date(date), "PPP");
}

export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
