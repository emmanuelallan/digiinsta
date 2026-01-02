"use server";

import { getPayload } from "payload";
import config from "@payload-config";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const payload = await getPayload({ config });
    const cookieStore = await cookies();

    // Login using Payload
    const { token, user } = await payload.login({
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

    if (token && user) {
      cookieStore.set("payload-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      redirect("/");
    }

    return { error: "Invalid email or password" };
  } catch (error: any) {
    return {
      error: error?.message || "Invalid email or password. Please try again.",
    };
  }
}
