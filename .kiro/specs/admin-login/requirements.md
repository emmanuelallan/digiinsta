# Requirements Document

## Introduction

Admin Login provides secure OTP-based authentication for authorized admin users. The system sends a one-time password to verified admin emails and validates the code before granting dashboard access.

## Glossary

- **Admin_User**: A user whose email is in the authorized admin list
- **OTP**: One-Time Password - a 6-digit numeric code valid for 10 minutes
- **Login_Form**: The email input form on the login page
- **OTP_Form**: The verification code input form
- **Session**: An authenticated admin session stored as an HTTP-only cookie

## Requirements

### Requirement 1: Email Submission

**User Story:** As an admin, I want to enter my email address, so that I can receive a login code.

#### Acceptance Criteria

1. WHEN the admin visits /login, THE Login_Form SHALL display an email input field with validation
2. WHEN the admin submits a valid email format, THE System SHALL check if the email is in the authorized admin list
3. WHEN the email is authorized, THE System SHALL generate a 6-digit OTP and send it to the email
4. WHEN the email is authorized, THE System SHALL transition to the OTP_Form step
5. WHEN the email is NOT authorized, THE System SHALL display "Invalid email address" error
6. WHEN the email format is invalid, THE Login_Form SHALL display a validation error without submitting

### Requirement 2: OTP Verification

**User Story:** As an admin, I want to enter the OTP code I received, so that I can access the dashboard.

#### Acceptance Criteria

1. WHEN the OTP_Form is displayed, THE System SHALL show a 6-digit OTP input component
2. WHEN the admin enters a valid 6-digit OTP, THE System SHALL verify it against the stored hash
3. WHEN the OTP is valid and not expired, THE System SHALL create a session and redirect to /dashboard
4. WHEN the OTP is invalid or expired, THE System SHALL display "Invalid or expired code" error
5. WHEN the admin clicks "Back", THE System SHALL return to the Login_Form step

### Requirement 3: Resend OTP with Cooldown

**User Story:** As an admin, I want to request a new code if I didn't receive one, so that I can complete login.

#### Acceptance Criteria

1. WHEN the OTP_Form is displayed, THE System SHALL show a "Resend code" button
2. WHEN the admin clicks "Resend code", THE System SHALL generate and send a new OTP
3. AFTER sending an OTP, THE System SHALL disable the resend button for 60 seconds
4. WHILE the cooldown is active, THE System SHALL display remaining seconds on the button
5. WHEN the cooldown expires, THE System SHALL re-enable the resend button

### Requirement 4: Form Integration

**User Story:** As a developer, I want the login form to use existing UI components, so that it matches the application design.

#### Acceptance Criteria

1. THE Login_Form SHALL use the shadcn Field component for form structure
2. THE Login_Form SHALL use the shadcn Input component for email input
3. THE OTP_Form SHALL use the shadcn InputOTP component for code entry
4. THE System SHALL use the shadcn Button component for all buttons
5. THE System SHALL use react-hook-form for form state management
6. THE System SHALL use zod for validation schemas
7. THE System SHALL display loading states using the Loader2 icon during submissions

### Requirement 5: Session Management

**User Story:** As an admin, I want my session to persist, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN login is successful, THE System SHALL create a session token
2. THE System SHALL store the session token in an HTTP-only cookie
3. THE Session SHALL expire after 7 days
4. WHEN the session is valid, THE System SHALL allow access to admin routes
