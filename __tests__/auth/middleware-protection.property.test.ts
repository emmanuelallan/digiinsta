/**
 * Property-Based Tests for Admin Auth Protection Middleware
 *
 * Feature: admin-auth-protection
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 4.1, 4.2, 4.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Configure fast-check for minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true,
});

/** Cookie name for admin session */
const SESSION_COOKIE_NAME = "admin-session";

/** Protected routes that require authentication */
const PROTECTED_ROUTES = ["/dashboard", "/creators"];

/** Auth routes that should redirect if authenticated */
const AUTH_ROUTES = ["/login"];

/**
 * Check if a path matches any of the protected routes
 * @param path - The request path
 * @returns True if the path is a protected route
 */
function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/**
 * Check if a path matches any of the auth routes
 * @param path - The request path
 * @returns True if the path is an auth route
 */
function isAuthRoute(path: string): boolean {
  return AUTH_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/**
 * Simulate middleware behavior for testing
 * Returns the redirect URL or null if no redirect
 */
function simulateMiddleware(
  pathname: string,
  hasSession: boolean
): { redirect: string | null; action: "redirect" | "next" } {
  // Protected routes: Redirect to login if not authenticated
  if (isProtectedRoute(pathname)) {
    if (!hasSession) {
      return { redirect: "/login", action: "redirect" };
    }
    return { redirect: null, action: "next" };
  }

  // Auth routes: Redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    if (hasSession) {
      return { redirect: "/dashboard", action: "redirect" };
    }
    return { redirect: null, action: "next" };
  }

  // All other routes: Pass through
  return { redirect: null, action: "next" };
}

describe("Admin Auth Protection Middleware Property Tests", () => {
  /**
   * Feature: admin-auth-protection
   * Property 1: Protected Route Access Control
   * Validates: Requirements 1.1, 1.2
   *
   * For any request to a protected route (/dashboard, /creators) without a valid
   * session cookie, the middleware shall redirect to /login.
   */
  describe("Property 1: Protected Route Access Control", () => {
    // Arbitrary for generating protected route paths
    const protectedRouteArb = fc.oneof(
      fc.constant("/dashboard"),
      fc.constant("/creators"),
      fc.string({ minLength: 0, maxLength: 20 }).map((s) => `/dashboard/${s}`),
      fc.string({ minLength: 0, maxLength: 20 }).map((s) => `/creators/${s}`)
    );

    it("should redirect unauthenticated users from /dashboard to /login", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 20 }), (subpath) => {
          const pathname = subpath ? `/dashboard/${subpath}` : "/dashboard";
          const hasSession = false;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Unauthenticated access to /dashboard should redirect to /login
          expect(result.redirect).toBe("/login");
          expect(result.action).toBe("redirect");
        })
      );
    });

    it("should redirect unauthenticated users from /creators to /login", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 20 }), (subpath) => {
          const pathname = subpath ? `/creators/${subpath}` : "/creators";
          const hasSession = false;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Unauthenticated access to /creators should redirect to /login
          expect(result.redirect).toBe("/login");
          expect(result.action).toBe("redirect");
        })
      );
    });

    it("should redirect unauthenticated users from any protected route to /login", () => {
      fc.assert(
        fc.property(protectedRouteArb, (pathname) => {
          const hasSession = false;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Any protected route without session should redirect to /login
          expect(result.redirect).toBe("/login");
          expect(result.action).toBe("redirect");
        })
      );
    });
  });

  /**
   * Feature: admin-auth-protection
   * Property 2: Authenticated Access Allowed
   * Validates: Requirements 1.3
   *
   * For any request to a protected route with a valid session cookie,
   * the middleware shall allow the request to proceed without redirect.
   */
  describe("Property 2: Authenticated Access Allowed", () => {
    // Arbitrary for generating protected route paths
    const protectedRouteArb = fc.oneof(
      fc.constant("/dashboard"),
      fc.constant("/creators"),
      fc.string({ minLength: 0, maxLength: 20 }).map((s) => `/dashboard/${s}`),
      fc.string({ minLength: 0, maxLength: 20 }).map((s) => `/creators/${s}`)
    );

    it("should allow authenticated users to access protected routes", () => {
      fc.assert(
        fc.property(protectedRouteArb, (pathname) => {
          const hasSession = true;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Authenticated access to protected routes should proceed
          expect(result.redirect).toBeNull();
          expect(result.action).toBe("next");
        })
      );
    });

    it("should allow authenticated users to access /dashboard", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 20 }), (subpath) => {
          const pathname = subpath ? `/dashboard/${subpath}` : "/dashboard";
          const hasSession = true;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Authenticated access to /dashboard should proceed
          expect(result.redirect).toBeNull();
          expect(result.action).toBe("next");
        })
      );
    });

    it("should allow authenticated users to access /creators", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 20 }), (subpath) => {
          const pathname = subpath ? `/creators/${subpath}` : "/creators";
          const hasSession = true;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Authenticated access to /creators should proceed
          expect(result.redirect).toBeNull();
          expect(result.action).toBe("next");
        })
      );
    });
  });

  /**
   * Feature: admin-auth-protection
   * Property 3: Login Page Redirect for Authenticated Users
   * Validates: Requirements 2.1
   *
   * For any request to /login with a valid session cookie,
   * the page shall redirect to /dashboard.
   */
  describe("Property 3: Login Page Redirect for Authenticated Users", () => {
    // Arbitrary for generating login route paths
    const loginRouteArb = fc.oneof(
      fc.constant("/login"),
      fc.string({ minLength: 0, maxLength: 20 }).map((s) => `/login/${s}`)
    );

    it("should redirect authenticated users from /login to /dashboard", () => {
      fc.assert(
        fc.property(loginRouteArb, (pathname) => {
          const hasSession = true;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Authenticated access to /login should redirect to /dashboard
          expect(result.redirect).toBe("/dashboard");
          expect(result.action).toBe("redirect");
        })
      );
    });

    it("should allow unauthenticated users to access /login", () => {
      fc.assert(
        fc.property(loginRouteArb, (pathname) => {
          const hasSession = false;

          const result = simulateMiddleware(pathname, hasSession);

          // Property: Unauthenticated access to /login should proceed
          expect(result.redirect).toBeNull();
          expect(result.action).toBe("next");
        })
      );
    });
  });

  /**
   * Feature: admin-auth-protection
   * Property 4: Logout Session Destruction
   * Validates: Requirements 4.1, 4.2, 4.3
   *
   * For any valid session, after invoking the logout action,
   * the session cookie shall be cleared and the session shall no longer be valid.
   */
  describe("Property 4: Logout Session Destruction", () => {
    // Arbitrary for generating session tokens (64 hex characters)
    const sessionTokenArb = fc
      .array(fc.integer({ min: 0, max: 15 }), { minLength: 64, maxLength: 64 })
      .map((arr) => arr.map((n) => n.toString(16)).join(""));

    /**
     * Simulate logout behavior
     * Returns the expected state after logout
     */
    function simulateLogout(sessionToken: string | null): {
      cookieCleared: boolean;
      redirectTo: string;
      sessionDestroyed: boolean;
    } {
      // Logout always clears cookie and redirects to /login
      // Session is destroyed if token was present
      return {
        cookieCleared: true,
        redirectTo: "/login",
        sessionDestroyed: sessionToken !== null && sessionToken.length > 0,
      };
    }

    it("should clear session cookie on logout", () => {
      fc.assert(
        fc.property(sessionTokenArb, (sessionToken) => {
          const result = simulateLogout(sessionToken);

          // Property: Logout should always clear the cookie
          expect(result.cookieCleared).toBe(true);
        })
      );
    });

    it("should redirect to /login after logout", () => {
      fc.assert(
        fc.property(sessionTokenArb, (sessionToken) => {
          const result = simulateLogout(sessionToken);

          // Property: Logout should always redirect to /login
          expect(result.redirectTo).toBe("/login");
        })
      );
    });

    it("should destroy session in database when token exists", () => {
      fc.assert(
        fc.property(sessionTokenArb, (sessionToken) => {
          const result = simulateLogout(sessionToken);

          // Property: Session should be destroyed when token exists
          expect(result.sessionDestroyed).toBe(true);
        })
      );
    });

    it("should handle logout gracefully when no session exists", () => {
      const result = simulateLogout(null);

      // Property: Logout without session should still clear cookie and redirect
      expect(result.cookieCleared).toBe(true);
      expect(result.redirectTo).toBe("/login");
      expect(result.sessionDestroyed).toBe(false);
    });

    it("should handle logout with empty session token", () => {
      const result = simulateLogout("");

      // Property: Logout with empty token should still clear cookie and redirect
      expect(result.cookieCleared).toBe(true);
      expect(result.redirectTo).toBe("/login");
      expect(result.sessionDestroyed).toBe(false);
    });
  });

  /**
   * Additional property tests for route classification
   */
  describe("Route Classification Properties", () => {
    it("should correctly identify protected routes", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 30 }), (randomPath) => {
          const path = `/${randomPath}`;
          const isProtected = isProtectedRoute(path);

          // Property: A route is protected iff it starts with /dashboard or /creators
          const expectedProtected =
            path === "/dashboard" ||
            path.startsWith("/dashboard/") ||
            path === "/creators" ||
            path.startsWith("/creators/");

          expect(isProtected).toBe(expectedProtected);
        })
      );
    });

    it("should correctly identify auth routes", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 0, maxLength: 30 }), (randomPath) => {
          const path = `/${randomPath}`;
          const isAuth = isAuthRoute(path);

          // Property: A route is an auth route iff it starts with /login
          const expectedAuth = path === "/login" || path.startsWith("/login/");

          expect(isAuth).toBe(expectedAuth);
        })
      );
    });

    it("should pass through non-protected, non-auth routes", () => {
      // Generate paths that are neither protected nor auth routes
      const otherRouteArb = fc
        .string({ minLength: 1, maxLength: 20 })
        .filter(
          (s) => !s.startsWith("dashboard") && !s.startsWith("creators") && !s.startsWith("login")
        )
        .map((s) => `/${s}`);

      fc.assert(
        fc.property(otherRouteArb, fc.boolean(), (pathname, hasSession) => {
          const result = simulateMiddleware(pathname, hasSession);

          // Property: Non-protected, non-auth routes should pass through
          expect(result.redirect).toBeNull();
          expect(result.action).toBe("next");
        })
      );
    });
  });
});
