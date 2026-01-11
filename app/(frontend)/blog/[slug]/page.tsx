import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserIcon,
  ArrowLeft02Icon,
  Share01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/storefront";
import { RichText } from "@/components/storefront/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbSchema, getArticleSchema, SITE_URL, SITE_NAME } from "@/lib/seo";
import { getFormattedReadingTime, extractTextFromRichContent } from "@/lib/blog/reading-time";
import { TableOfContents, RelatedPosts } from "@/components/storefront/blog";
import { extractHeadings } from "@/lib/blog/toc-extraction";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const description = post.excerpt ?? `Read ${post.title} on the ${SITE_NAME} blog.`;
  const imageUrl = post.featuredImage?.url;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | ${SITE_NAME} Blog`,
      description,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name ?? "DigiInsta Team"],
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${SITE_NAME}`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await getRelatedPosts(post.id, post.category?.id ?? null, 3);

  // Calculate reading time
  const readingTime = getFormattedReadingTime(post.content);
  const plainTextContent = extractTextFromRichContent(post.content);

  // Check if post has enough headings for TOC (3+ headings)
  const headings = extractHeadings(post.content);
  const showTableOfContents = headings.length >= 3;

  // Generate Article JSON-LD using centralized function
  // Requirements: 9.3 - JSON-LD structured data for blog posts
  const articleSchema = getArticleSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: plainTextContent,
    featuredImage: post.featuredImage,
    category: post.category ? { title: post.category.title } : null,
    createdBy: { name: post.author.name },
    createdAt: post.publishedAt ?? post.createdAt,
    updatedAt: post.updatedAt,
  });

  // Generate breadcrumb JSON-LD
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <nav className="border-b" aria-label="Breadcrumb">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/blog">Blog</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">{post.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </nav>

        {/* Hero Image */}
        {post.featuredImage?.url && (
          <div className="bg-muted relative h-64 sm:h-80 lg:h-96">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* Article Header */}
        <header
          className={`mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 ${post.featuredImage?.url ? "relative z-10 -mt-24" : "pt-12"}`}
        >
          <div
            className={`${post.featuredImage?.url ? "bg-background rounded-2xl p-6 shadow-lg sm:p-8" : ""}`}
          >
            {/* Category */}
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category.title}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} size={18} />
                <span>{post.author.name ?? "DigiInsta Team"}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} size={18} />
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} size={18} />
                <span>{readingTime}</span>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-muted-foreground mt-6 text-lg leading-relaxed">{post.excerpt}</p>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Table of Contents for long posts */}
          {showTableOfContents && (
            <TableOfContents
              content={post.content}
              className="mb-8"
              title="In This Article"
              minHeadings={3}
            />
          )}

          <div className="prose prose-lg prose-neutral dark:prose-invert mx-auto max-w-none">
            <RichText content={post.content} />
          </div>

          {/* Author Bio Section */}
          <div className="mt-12 border-t pt-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
                <HugeiconsIcon icon={UserIcon} size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-foreground text-lg font-semibold">
                  {post.author.name ?? "DigiInsta Team"}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Content creator at {SITE_NAME}. Passionate about helping people achieve their
                  goals with digital tools and productivity systems.
                </p>
                <Link
                  href="/blog"
                  className="text-primary hover:text-primary/80 mt-2 inline-block text-sm font-medium"
                >
                  View all posts →
                </Link>
              </div>
            </div>
          </div>

          {/* Share & Back */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
            <Button variant="outline" asChild>
              <Link href="/blog">
                <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="mr-2" />
                Back to Blog
              </Link>
            </Button>

            <Button variant="ghost" size="sm">
              <HugeiconsIcon icon={Share01Icon} size={16} className="mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <RelatedPosts
                posts={relatedPosts}
                title="Related Posts"
                subtitle="Continue reading with these related articles"
                viewAllHref="/blog"
                viewAllLabel="View All Posts"
                maxPosts={3}
              />
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-muted/30 border-t py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-foreground text-2xl font-bold">Ready to Get Started?</h2>
              <p className="text-muted-foreground mt-2">
                Explore our collection of digital planners and templates to boost your productivity.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bundles">View Bundles</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
