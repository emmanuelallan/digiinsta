# Design Document: Admin Login

## Overview

The admin login system provides secure OTP-based authentication using existing shadcn UI components and react-hook-form. The implementation follows a two-step flow: email submission followed by OTP verification.

## Architecture

```mermaid
flowchart TD
    A[/login page] --> B{Email Step}
    B -->|Submit Email| C[Server Action: requestOTP]
    C -->|Authorized| D[Generate OTP]
    D --> E[Store OTP Hash in DB]
    E --> F[Send Email via Resend]
    F --> G{OTP Step}
    C -->|Not Authorized| H[Show Error]
    H --> B
    G -->|Submit OTP| I[Server Action: verifyOTP]
    I -->|Valid| J[Create Session]
    J --> K[Set Cookie]
    K --> L[Redirect to /dashboard]
    I -->|Invalid| M[Show Error]
    M --> G
    G -->|Back| B
    G -->|Resend| C
```

## Components and Interfaces

### Login Page Component

The login page is a client component that manages the two-step flow using local state and server actions.

```typescript
// app/(app)/login/page.tsx
"use client";

interface LoginPageState {
  step: "email" | "otp";
  email: string;
  cooldown: number; // seconds remaining for resend
}
```

### Server Actions

```typescript
// app/(app)/login/actions.ts
"use server";

interface RequestOTPResult {
  success?: boolean;
  error?: string;
  email?: string;
}

interface VerifyOTPResult {
  success?: boolean;
  error?: string;
}

// Request OTP - validates email and sends code
async function requestOTP(formData: FormData): Promise<RequestOTPResult>;

// Verify OTP - validates code and creates session
async function verifyOTP(formData: FormData): Promise<VerifyOTPResult>;

// Resend OTP - generates new code (called directly, not via form)
async function resendOTP(email: string): Promise<RequestOTPResult>;
```

### Form Schemas (Zod)

```typescript
// Email validation
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// OTP validation
const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Please enter a 6-digit code"),
});
```

### UI Component Usage

| Component                                                 | Source                    | Usage                            |
| --------------------------------------------------------- | ------------------------- | -------------------------------- |
| Field, FieldLabel, FieldError, FieldGroup                 | @/components/ui/field     | Form structure and error display |
| Input                                                     | @/components/ui/input     | Email input                      |
| InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator  | @/components/ui/input-otp | OTP code entry                   |
| Button                                                    | @/components/ui/button    | Submit and action buttons        |
| Card, CardHeader, CardContent, CardTitle, CardDescription | @/components/ui/card      | Page layout                      |
| Loader2                                                   | lucide-react              | Loading spinner                  |

### React Hook Form Integration

```typescript
// Email form
const emailForm = useForm<EmailFormData>({
  resolver: zodResolver(emailSchema),
  defaultValues: { email: "" },
});

// OTP form
const otpForm = useForm<OTPFormData>({
  resolver: zodResolver(otpSchema),
  defaultValues: { email: "", otp: "" },
});
```

## Data Models

### Admin Session (Database)

```sql
-- Existing table: admin_sessions
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  otp_hash VARCHAR(255),
  otp_expires_at TIMESTAMP,
  session_token VARCHAR(255),
  session_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### OTP Configuration

| Setting          | Value      |
| ---------------- | ---------- |
| OTP Length       | 6 digits   |
| OTP Expiration   | 10 minutes |
| Resend Cooldown  | 60 seconds |
| Session Duration | 7 days     |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do._

### Property 1: Authorization Check

_For any_ email submitted to the login form, the system should return an error if and only if the email is not in the authorized admin list.

**Validates: Requirements 1.2, 1.5**

### Property 2: OTP Generation for Authorized Emails

_For any_ authorized admin email, submitting the email should result in a 6-digit OTP being generated and stored.

**Validates: Requirements 1.3**

### Property 3: Invalid Email Format Rejection

_For any_ string that is not a valid email format, the form should display a validation error without making a server request.

**Validates: Requirements 1.6**

### Property 4: OTP Verification Correctness

_For any_ stored OTP and email combination, verification should succeed if and only if the provided OTP matches the stored hash and has not expired.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 5: Session Creation on Valid OTP

_For any_ valid OTP verification, the system should create a session token and set it as an HTTP-only cookie.

**Validates: Requirements 5.1, 5.2**

### Property 6: Cooldown Enforcement

_For any_ OTP send action, the resend button should be disabled for exactly 60 seconds before re-enabling.

**Validates: Requirements 3.3, 3.5**

## Error Handling

| Scenario             | Error Message                             | Action                          |
| -------------------- | ----------------------------------------- | ------------------------------- |
| Invalid email format | "Please enter a valid email address"      | Show inline error, don't submit |
| Unauthorized email   | "Invalid email address"                   | Show error, stay on email step  |
| Invalid OTP          | "Invalid or expired code"                 | Show error, stay on OTP step    |
| Expired OTP          | "Invalid or expired code"                 | Show error, allow resend        |
| Server error         | "Something went wrong. Please try again." | Show error, allow retry         |

## Testing Strategy

### Unit Tests

- Email validation schema tests
- OTP validation schema tests
- Authorization check function tests
- OTP hash/verify function tests

### Property-Based Tests

Using fast-check for property-based testing:

1. **Authorization property**: Generate random emails, verify only admin emails pass
2. **OTP format property**: Generate random 6-digit codes, verify all are accepted
3. **Invalid OTP property**: Generate random non-matching codes, verify all are rejected

### Integration Tests

- Full login flow with valid admin email
- Login attempt with unauthorized email
- OTP verification with valid code
- OTP verification with expired code
- Resend cooldown behavior
