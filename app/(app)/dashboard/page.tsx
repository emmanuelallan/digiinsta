/**
 * Admin Dashboard Page
 *
 * Displays sales metrics, recent orders, and analytics from Neon PostgreSQL.
 * Requires admin authentication.
 *
 * Requirements: 6.4
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth/session";
import { Dashboard } from "@/components/admin/Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Check authentication
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin-session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">DigiInsta Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{session.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <a
              href="/dashboard"
              className="border-primary text-foreground border-b-2 py-3 text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/creators"
              className="text-muted-foreground hover:text-foreground py-3 text-sm font-medium"
            >
              Creators
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  );
}
