import { type NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Admin revalidation endpoint
 * Allows admins to manually trigger cache revalidation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { paths, all } = body;

    const revalidated: string[] = [];

    if (all) {
      // Revalidate all common paths
      const commonPaths = ["/", "/products", "/categories", "/bundles", "/blog"];
      for (const path of commonPaths) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
  }
}
