import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionContent } from "./collection-content";
import { getCollectionBySlug } from "@/lib/db/collections";
import { getProductsByCollection } from "@/lib/db/products";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Handle special collection slugs
  if (slug === 'all') {
    return {
      title: "All Products | Digital love for the heart 💖",
      description: "Browse our complete collection of digital products for meaningful relationships",
      openGraph: {
        title: "All Products | Digital love for the heart 💖",
        description: "Browse our complete collection of digital products for meaningful relationships",
        type: "website",
        url: `https://digitallove.com/collections/all`,
        siteName: "Digital love for the heart",
      },
      twitter: {
        card: "summary_large_image",
        title: "All Products | Digital love for the heart 💖",
        description: "Browse our complete collection of digital products for meaningful relationships",
      },
    };
  }
  
  if (slug === 'best-sellers') {
    return {
      title: "Best Sellers | Digital love for the heart 💖",
      description: "Discover our most loved digital products for creating deeper connections",
      openGraph: {
        title: "Best Sellers | Digital love for the heart 💖",
        description: "Discover our most loved digital products for creating deeper connections",
        type: "website",
        url: `https://digitallove.com/collections/best-sellers`,
        siteName: "Digital love for the heart",
      },
      twitter: {
        card: "summary_large_image",
        title: "Best Sellers | Digital love for the heart 💖",
        description: "Discover our most loved digital products for creating deeper connections",
      },
    };
  }
  
  if (slug === 'new-arrivals') {
    return {
      title: "New Arrivals | Digital love for the heart 💖",
      description: "Check out our latest digital products for meaningful relationships",
      openGraph: {
        title: "New Arrivals | Digital love for the heart 💖",
        description: "Check out our latest digital products for meaningful relationships",
        type: "website",
        url: `https://digitallove.com/collections/new-arrivals`,
        siteName: "Digital love for the heart",
      },
      twitter: {
        card: "summary_large_image",
        title: "New Arrivals | Digital love for the heart 💖",
        description: "Check out our latest digital products for meaningful relationships",
      },
    };
  }
  
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: `${collection.name} | Digital love for the heart 💖`,
    description: collection.emotionalCopy || collection.description,
    openGraph: {
      title: `${collection.name} | Digital love for the heart 💖`,
      description: collection.emotionalCopy || collection.description,
      type: "website",
      url: `https://digitallove.com/collections/${slug}`,
      siteName: "Digital love for the heart",
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.name} | Digital love for the heart 💖`,
      description: collection.emotionalCopy || collection.description,
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  // Await params to get the slug
  const { slug } = await params;
  
  // Handle special collection slugs
  if (slug === 'all' || slug === 'best-sellers' || slug === 'new-arrivals') {
    const { getBestSellerProducts, getNewProducts } = await import('@/lib/db/products');
    
    let allProducts;
    let specialCollection;
    
    if (slug === 'all') {
      allProducts = await getBestSellerProducts(100);
      specialCollection = {
        name: 'All Products',
        description: 'Discover all our thoughtfully designed tools for meaningful connections',
      };
    } else if (slug === 'best-sellers') {
      allProducts = await getBestSellerProducts(100);
      specialCollection = {
        name: 'Best Sellers',
        description: 'Discover the tools that have helped thousands create deeper connections',
      };
    } else {
      // new-arrivals
      allProducts = await getNewProducts(100);
      specialCollection = {
        name: 'New Arrivals',
        description: 'Check out our latest digital products for meaningful relationships',
      };
    }
    
    return (
      <div className="flex flex-col">
        <CollectionContent 
          products={allProducts}
          collectionName={specialCollection.name}
          collectionDescription={specialCollection.description}
        />
      </div>
    );
  }
  
  // Fetch collection by slug
  const collection = await getCollectionBySlug(slug);

  // Handle 404 for invalid collection slugs
  if (!collection) {
    notFound();
  }

  // Fetch products matching collection taxonomy
  const products = await getProductsByCollection(slug);

  return (
    <div className="flex flex-col">
      {/* Main Content Area with Filtering and Sorting */}
      <CollectionContent 
        products={products}
        collectionName={collection.name}
        collectionDescription={collection.emotionalCopy || collection.description}
      />
    </div>
  );
}
