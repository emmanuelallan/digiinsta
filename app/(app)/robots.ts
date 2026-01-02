import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/download/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

