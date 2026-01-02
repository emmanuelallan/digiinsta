"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const payload = await getPayload({ config });
    const cookieStore = await cookies();

    // Create user using Payload
    const user = await payload.create({
      collection: "users" as any,
      data: {
        email,
        password,
        name,
      },
    });

    if (user) {
      // Auto-login after signup
      const { token } = await payload.login({
        collection: "users" as any,
        data: {
          email,
          password,
        },
        req: {
          headers: new Headers(),
          cookies: cookieStore,
        } as any,
      });

      if (token) {
        cookieStore.set("payload-token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      redirect("/");
    }

    return { error: "Failed to create account" };
  } catch (error: any) {
    return {
      error: error?.message || error?.errors?.[0]?.message || "Failed to create account. Please try again.",
    };
  }
}
