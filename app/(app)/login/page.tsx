"use client";

/**
 * Admin Login Page
 *
 * Provides email-based OTP authentication for admin users.
 * Only authorized admin emails can log in.
 * Uses React Hook Form with Zod v4 validation via Standard Schema resolver.
 *
 * Requirements: 8.1, 8.2
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

// Validation schemas
const emailSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "Please enter a valid 6-digit code"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

type LoginStep = "email" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Email form with standard schema resolver for zod v4
  const emailForm = useForm<EmailFormData>({
    resolver: standardSchemaResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // OTP form with standard schema resolver for zod v4
  const otpForm = useForm<OtpFormData>({
    resolver: standardSchemaResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim() }),
      });

      const result = await response.json();

      if (response.status === 429) {
        emailForm.setError("email", {
          message: result.error || "Too many attempts. Please try again later.",
        });
        return;
      }

      setEmail(data.email.trim());
      toast.success("If this email is registered, you will receive a login code");
      setStep("otp");
    } catch (error) {
      console.error("Login error:", error);
      emailForm.setError("email", {
        message: "An error occurred. Please try again.",
      });
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: data.otp.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        otpForm.setError("otp", {
          message: result.error || "Invalid or expired code",
        });
        return;
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Verify error:", error);
      otpForm.setError("otp", {
        message: "An error occurred. Please try again.",
      });
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    otpForm.setValue("otp", value);

    if (value.length === 6) {
      // Auto-submit when OTP is complete
      otpForm.handleSubmit(onOtpSubmit)();
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp("");
    otpForm.reset();
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (response.status === 429) {
        toast.error(result.error || "Too many attempts. Please try again later.");
        return;
      }

      toast.success("A new code has been sent to your email");
    } catch {
      toast.error("Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Image
              src="/logos/logo.svg"
              alt="DigiInsta"
              width={40}
              height={40}
              className="dark:invert"
            />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your admin email to receive a login code"
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
              <FieldGroup>
                <Field data-invalid={!!emailForm.formState.errors.email}>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      className="pl-10"
                      disabled={emailForm.formState.isSubmitting}
                      autoComplete="email"
                      autoFocus
                      aria-invalid={!!emailForm.formState.errors.email}
                      {...emailForm.register("email")}
                    />
                  </div>
                  <FieldDescription>Only authorized admin emails can log in.</FieldDescription>
                  {emailForm.formState.errors.email && (
                    <FieldError>{emailForm.formState.errors.email.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Login Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
              <FieldGroup>
                <Field data-invalid={!!otpForm.formState.errors.otp}>
                  <FieldLabel className="block text-center">Verification Code</FieldLabel>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={otpForm.formState.isSubmitting}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <FieldDescription className="text-center">
                    The code expires in 10 minutes
                  </FieldDescription>
                  {otpForm.formState.errors.otp && (
                    <FieldError className="text-center">
                      {otpForm.formState.errors.otp.message}
                    </FieldError>
                  )}
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full"
                disabled={otpForm.formState.isSubmitting || otp.length !== 6}
              >
                {otpForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToEmail}
                  disabled={otpForm.formState.isSubmitting}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={otpForm.formState.isSubmitting}
                >
                  Resend Code
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
