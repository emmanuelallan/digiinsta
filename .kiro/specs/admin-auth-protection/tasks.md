# Implementation Plan: Admin Auth Protection

## Overview

Implement route protection middleware, login page auth check, consolidated admin layout, and logout functionality for the admin panel.

## Tasks

- [x] 1. Create middleware for route protection
  - Create `proxy.ts` in project root
  - Define protected routes (`/dashboard`, `/creators`)
  - Define auth routes (`/login`)
  - Check for `admin-session` cookie presence
  - Redirect unauthenticated users from protected routes to `/login`
  - Redirect authenticated users from `/login` to `/dashboard`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [x] 2. Create logout API route
  - [x] 2.1 Create `app/api/auth/logout/route.ts`
    - Handle POST requests
    - Call `destroySession()` with session token
    - Clear the `admin-session` cookie
    - Redirect to `/login`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Refactor admin layout with shared header and navigation
  - [x] 3.1 Update `app/(app)/layout.tsx` to include authentication check
    - Validate session in layout
    - Pass session data to children via context or props
    - _Requirements: 3.1, 3.5_
  - [x] 3.2 Create shared admin header component
    - Create `components/admin/AdminHeader.tsx`
    - Display site title "DigiInsta Admin"
    - Display user email from session
    - Include logout button/form
    - _Requirements: 3.1, 3.5_
  - [x] 3.3 Create shared admin navigation component
    - Create `components/admin/AdminNav.tsx`
    - Include links to Dashboard and Creators
    - Highlight active navigation item based on current path
    - _Requirements: 3.2, 3.4_

- [x] 4. Simplify page components
  - [x] 4.1 Update `app/(app)/dashboard/page.tsx`
    - Remove duplicated header and navigation code
    - Keep only page-specific content
    - Remove redundant auth check (handled by layout)
    - _Requirements: 3.3_
  - [x] 4.2 Update `app/(app)/creators/page.tsx`
    - Remove duplicated header and navigation code
    - Keep only page-specific content
    - Remove redundant auth check (handled by layout)
    - _Requirements: 3.3_

- [x] 5. Update login page to check authentication
  - Add server-side auth check at top of page
  - Redirect to `/dashboard` if already authenticated
  - _Requirements: 2.1, 2.2_

- [x] 6. Checkpoint - Verify all flows work correctly
  - Ensure all tests pass, ask the user if questions arise.
  - Test: Unauthenticated user → protected route → redirected to login
  - Test: Authenticated user → login page → redirected to dashboard
  - Test: Logout → session cleared → redirected to login

- [x] 7. Write property tests for middleware behavior
  - [x] 7.1 Write property test for protected route access control
    - **Property 1: Protected Route Access Control**
    - **Validates: Requirements 1.1, 1.2**
  - [x] 7.2 Write property test for authenticated access
    - **Property 2: Authenticated Access Allowed**
    - **Validates: Requirements 1.3**
  - [x] 7.3 Write property test for login redirect
    - **Property 3: Login Page Redirect for Authenticated Users**
    - **Validates: Requirements 2.1**
  - [x] 7.4 Write property test for logout
    - **Property 4: Logout Session Destruction**
    - **Validates: Requirements 4.1, 4.2, 4.3**

## Notes

- The middleware uses cookie presence check for speed; full validation happens in the layout
- Existing `destroySession()` function in `lib/auth/session.ts` handles database cleanup
