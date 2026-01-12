"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { requestOTP, verifyOTP, resendOTP } from "./actions";

const OTP_COOLDOWN_SECONDS = 60;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedEmail = emailInput.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);
    setIsEmailLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", trimmedEmail);

      const result = await requestOTP(null, formData);

      if (result.error) {
        setError(result.error);
      } else if (result.step === "otp" && result.email) {
        setEmail(result.email);
        setStep("otp");
        setCooldown(OTP_COOLDOWN_SECONDS);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (otpInput.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setError(null);
    setIsOtpLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otpInput);

      const result = await verifyOTP(null, formData);

      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResendLoading) return;
    setError(null);
    setIsResendLoading(true);

    try {
      const result = await resendOTP(email);

      if (result.error) {
        setError(result.error);
      } else {
        setCooldown(OTP_COOLDOWN_SECONDS);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setError(null);
    setOtpInput("");
  };

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Mail className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            {step === "email" ? "Admin Login" : "Enter Code"}
          </CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your email to receive a login code"
              : `We sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  autoFocus
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isEmailLoading}>
                {isEmailLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Login Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput} autoFocus>
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
                {error && <p className="text-destructive text-center text-sm">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isOtpLoading || otpInput.length < 6}
              >
                {isOtpLoading ? (
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
                  onClick={handleBack}
                  className="gap-1 px-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResendLoading}
                  className="px-0"
                >
                  {isResendLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
