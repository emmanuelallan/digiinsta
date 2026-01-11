/**
 * DashboardView - Admin Dashboard Component
 * Displays sales metrics and analytics
 * Requirements: 7.1, 7.2, 7.3
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth/session";
import { Dashboard } from "./Dashboard";

/**
 * DashboardView - Wrapper component for admin dashboard
 * Implements access control to verify admin session before rendering
 * Requirements: 7.1, 7.2, 7.3
 */
export async function DashboardView() {
  // Get session from cookies
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  // Requirement 7.1: Deny access to non-authenticated users
  if (!sessionToken) {
    redirect("/login");
  }

  // Validate session
  const session = await validateSession(sessionToken);
  if (!session) {
    redirect("/login");
  }

  // Requirement 7.2: Admin users can access all metrics
  return <Dashboard />;
}

export default DashboardView;
