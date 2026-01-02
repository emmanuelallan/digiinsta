"use server";

import { getPayload } from "payload";
import { headers } from "next/headers";
import config from "@payload-config";

/**
 * Get current user from Payload CMS session
 * Returns null for guest users
 *
 * This uses Payload's built-in authentication system
 */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name?: string;
  role?: string;
} | null> {
  try {
    const payload = await getPayload({ config });
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (user) {
      return {
        id: String(user.id),
        email: user.email,
        name: (user as { name?: string }).name,
        role: (user as { role?: string }).role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get Payload instance with current user context
 * Use this when you need both payload and user
 */
export async function getPayloadWithAuth() {
  const payload = await getPayload({ config });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  return { payload, user };
}
