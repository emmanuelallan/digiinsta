/**
 * Admin Header Component
 *
 * Displays site title, user email, and logout button.
 * Used across all admin pages for consistent branding.
 *
 * Requirements: 3.1, 3.5
 */

"use client";

interface AdminHeaderProps {
  email: string;
}

export function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-semibold">DigiInsta Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{email}</span>
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
  );
}
