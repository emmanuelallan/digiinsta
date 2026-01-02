import { MetadataRoute } from "next";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config });
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    // Add categories
    const categories = await payload.find({
      collection: "categories" as any,
      where: {
        status: {
          equals: "active",
        },
      },
      limit: 1000,
    });

    for (const category of categories.docs) {
      const cat = category as { slug: string; updatedAt?: string };
      routes.push({
        url: `${baseUrl}/categories/${cat.slug}`,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Add products
    const products = await payload.find({
      collection: "products" as any,
      where: {
        status: {
          equals: "active",
        },
      },
      limit: 1000,
    });

    for (const product of products.docs) {
      const prod = product as { slug: string; updatedAt?: string };
      routes.push({
        url: `${baseUrl}/products/${prod.slug}`,
        lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    // Add bundles
    const bundles = await payload.find({
      collection: "bundles" as any,
      where: {
        status: {
          equals: "active",
        },
      },
      limit: 1000,
    });

    for (const bundle of bundles.docs) {
      const bun = bundle as { slug: string; updatedAt?: string };
      routes.push({
        url: `${baseUrl}/bundles/${bun.slug}`,
        lastModified: bun.updatedAt ? new Date(bun.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return routes;
}

