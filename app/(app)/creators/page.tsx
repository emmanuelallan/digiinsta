/**
 * Creator Report Generation Page
 *
 * Lists all creators and allows generating report links for them.
 * Authentication is handled by the admin layout.
 *
 * Requirements: 4.4, 3.3
 */

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
  // Fetch creators from Sanity
  const creators = await getCreators();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Creator Reports</h2>
        <p className="text-muted-foreground mt-1">
          Generate report links for creators to view their sales and revenue data.
        </p>
      </div>

      <CreatorsClient creators={creators} />
    </>
  );
}
