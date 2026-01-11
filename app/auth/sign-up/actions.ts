"use server";

import { redirect } from "next/navigation";

/**
 * Sign-up action state type
 */
type SignUpState = { error?: string } | null;

/**
 * Sign-up with email action
 *
 * Note: Admin sign-up is disabled. Only pre-authorized emails can sign in.
 * Use the sign-in flow with OTP authentication.
 */
export async function signUpWithEmail(
  _prevState: SignUpState,
  _formData: FormData
): Promise<SignUpState> {
  // Sign-up is disabled - redirect to sign-in
  redirect("/auth/sign-in");
}

/**
 * Sign-up action (legacy)
 *
 * Note: Admin sign-up is disabled. Only pre-authorized emails can sign in.
 * Use the sign-in flow with OTP authentication.
 */
export async function signUp(_email: string, _password: string) {
  // Sign-up is disabled - redirect to sign-in
  redirect("/auth/sign-in");
}
