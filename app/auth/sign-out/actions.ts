"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function signOut() {
  // In Payload 3.x, logout is handled by clearing the auth cookie
  const cookieStore = await cookies();

  // Delete the Payload auth token cookie
  cookieStore.delete("payload-token");

  redirect("/auth/sign-in");
}
