/**
 * Admin Login Page
 *
 * Server component that checks authentication status before rendering.
 * Redirects authenticated users to dashboard.
 *
 * Requirements: 2.1, 2.2
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  // Server-side auth check - redirect authenticated users to dashboard
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin-session")?.value;

  if (sessionToken) {
    const session = await validateSession(sessionToken);
    if (session) {
      redirect("/dashboard");
    }
  }

  // Unauthenticated user - show login form
  return <LoginForm />;
}
