'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SESSION_CHECK_INTERVAL = 60000; // Check every 60 seconds
const SESSION_REFRESH_INTERVAL = 300000; // Refresh every 5 minutes

/**
 * Custom hook for managing session validation and refresh
 * Automatically validates session and redirects to login if expired
 * Refreshes session periodically to keep it alive
 */
export function useSession() {
  const router = useRouter();
  const pathname = usePathname();

  const validateSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (!data.valid) {
        // Session is invalid or expired, redirect to login
        if (pathname !== '/admin') {
          router.push('/admin');
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }, [router, pathname]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        // Failed to refresh, validate to check if session is still valid
        await validateSession();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, [validateSession]);

  useEffect(() => {
    // Skip session validation on login page
    if (pathname === '/admin') {
      return;
    }

    // Initial session validation
    validateSession();

    // Set up periodic session validation
    const validationInterval = setInterval(validateSession, SESSION_CHECK_INTERVAL);

    // Set up periodic session refresh
    const refreshInterval = setInterval(refreshSession, SESSION_REFRESH_INTERVAL);

    // Cleanup intervals on unmount
    return () => {
      clearInterval(validationInterval);
      clearInterval(refreshInterval);
    };
  }, [pathname, validateSession, refreshSession]);

  return {
    validateSession,
    refreshSession,
  };
}
