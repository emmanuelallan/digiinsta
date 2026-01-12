/**
 * Admin Dashboard Page
 *
 * Displays sales metrics, recent orders, and analytics from Neon PostgreSQL.
 * Authentication is handled by the admin layout.
 *
 * Requirements: 6.4, 3.3
 */

import { Dashboard } from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return <Dashboard />;
}
