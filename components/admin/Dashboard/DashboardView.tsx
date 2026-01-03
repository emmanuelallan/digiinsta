/**
 * DashboardView - Payload Admin Custom View Component
 * This component is registered as a custom view in Payload's admin config
 * Requirements: 7.1, 7.2, 7.3
 */

import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { redirect } from "next/navigation";
import { Dashboard } from "./Dashboard";

/**
 * DashboardView - Wrapper component for Payload admin custom view
 * Implements access control to verify admin role before rendering
 * Requirements: 7.1, 7.2, 7.3
 */
export async function DashboardView() {
  // Get current user from Payload auth
  const payload = await getPayload({ config });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  // Requirement 7.1: Deny access to non-admin users
  if (!user) {
    redirect("/admin/login");
  }

  // Check if user has admin role
  const userRole = (user as unknown as { role?: string }).role;
  if (userRole !== "admin") {
    // Non-admin users are denied access
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__error">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this dashboard.</p>
          <p>
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  // Requirement 7.2: Admin users can access all metrics
  return <Dashboard />;
}

export default DashboardView;
