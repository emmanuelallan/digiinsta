# Implementation Plan: Admin Login

## Overview

Implement a clean, professional admin login page using existing shadcn components, react-hook-form, and server actions. The implementation replaces the current broken login with a properly integrated solution.

## Tasks

- [x] 1. Create server actions for authentication
  - [x] 1.1 Create `app/(app)/login/actions.ts` with requestOTP, verifyOTP, and resendOTP functions
    - requestOTP: validate email, check authorization, generate OTP, send email
    - verifyOTP: validate OTP against stored hash, create session, set cookie
    - resendOTP: generate new OTP with rate limiting
    - Return proper error messages for unauthorized emails
    - _Requirements: 1.2, 1.3, 1.5, 2.2, 2.3, 2.4, 3.2, 5.1, 5.2_

- [x] 2. Create the login page component
  - [x] 2.1 Create `app/(app)/login/page.tsx` with two-step form
    - Use react-hook-form with zodResolver for validation
    - Email step: Field, Input, Button components
    - OTP step: Field, InputOTP, Button components
    - Local state for step, email, and cooldown
    - _Requirements: 1.1, 1.4, 1.6, 2.1, 2.5, 4.1-4.7_

  - [x] 2.2 Implement resend cooldown timer
    - 60-second countdown after sending OTP
    - Display remaining seconds on button
    - Re-enable button when cooldown expires
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [x] 3. Verify integration and styling
  - [x] 3.1 Test complete login flow
    - Submit authorized email → receive OTP → enter code → redirect to dashboard
    - Submit unauthorized email → see "Invalid email address" error
    - Enter wrong OTP → see "Invalid or expired code" error
    - Click Back → return to email step
    - Click Resend → new code sent, cooldown starts
    - _Requirements: 1.1-1.6, 2.1-2.5, 3.1-3.5_

  - [x] 3.2 Ensure styling matches storefront theme
    - Use Card component for layout
    - Consistent spacing and typography
    - Loading states with Loader2 spinner
    - _Requirements: 4.1-4.7_

- [ ] 4. Checkpoint - Ensure login works end-to-end
  - Test with real admin email
  - Verify OTP email is received
  - Verify session cookie is set
  - Verify redirect to dashboard works
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Uses existing lib/auth modules: admin.ts, admin-db.ts, session.ts, otp.ts
- Uses existing lib/email.ts for sending OTP emails
- InputOTP component requires controlled value/onChange pattern
- Server actions handle form submission without client-side fetch
