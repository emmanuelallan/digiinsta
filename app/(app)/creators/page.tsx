/**
 * Creator Report Generation Page
 *
 * Lists all creators and allows generating report links for them.
 * Requires admin authentication.
 *
 * Requirements: 4.4
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@/lib/auth/session";
import { sanityClient } from "@/lib/sanity/client";
import { CreatorsClient } from "./creators-client";

export const dynamic = "force-dynamic";

// GROQ query to fetch all creators
const CREATORS_QUERY = `*[_type == "creator" && status == "active"] | order(name asc) {
  _id,
  name,
  email,
  "slug": slug.current,
  bio,
  status
}`;

export interface Creator {
  _id: string;
  name: string;
  email: string;
  slug: string;
  bio?: string;
  status: string;
}

async function getCreators(): Promise<Creator[]> {
  return sanityClient.fetch(CREATORS_QUERY);
}

export default async function CreatorsPage() {
  // Check authentication
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin-session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    redirect("/login");
  }

  // Fetch creators from Sanity
  const creators = await getCreators();

  return (
    <div className="bg-background min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">DigiInsta Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{session.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <a
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground py-3 text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/creators"
              className="border-primary text-foreground border-b-2 py-3 text-sm font-medium"
            >
              Creators
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Creator Reports</h2>
          <p className="text-muted-foreground mt-1">
            Generate report links for creators to view their sales and revenue data.
          </p>
        </div>

        <CreatorsClient creators={creators} />
      </main>
    </div>
  );
}
