'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { AdminHeader } from '@/components/admin-header';
import { useSession } from '@/lib/auth/use-session';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize session management (validation and refresh)
  useSession();

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <AdminHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}
