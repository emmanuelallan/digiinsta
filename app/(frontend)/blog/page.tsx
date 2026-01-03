import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, UserIcon, ArrowRight01Icon, Newspaper } from "@hugeicons/core-free-icons";
import { getBlogPosts, getFeaturedPost, getBlogCategories } from "@/lib/storefront";
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
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog | Tips, Guides & Insights",
  description:
    "Explore our blog for productivity tips, template guides, and insights on digital planning, finance tracking, and personal growth.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description:
      "Explore our blog for productivity tips, template guides, and insights on digital planning.",
    url: `${SITE_URL}/blog`,
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const [{ posts }, featuredPost, categories] = await Promise.all([
    getBlogPosts({ limit: 12 }),
    getFeaturedPost(),
    getBlogCategories(),
  ]);

  // Filter out featured post from regular posts
  const regularPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b">
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
                <BreadcrumbPage>Blog</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
              <HugeiconsIcon icon={Newspaper} size={14} className="mr-1.5" />
              Our Blog
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tips, Guides & Insights
            </h1>

            <p className="mt-6 text-lg text-white/90 sm:text-xl">
              Discover productivity tips, template guides, and insights to help you make the most of
              your digital tools and achieve your goals.
            </p>

            {categories.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20"
                  >
                    {category.title}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="border-b py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline" className="text-primary">
                Featured Post
              </Badge>
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Image */}
                <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-2xl">
                  {featuredPost.featuredImage?.url ? (
                    <Image
                      src={featuredPost.featuredImage.url}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                      <HugeiconsIcon
                        icon={Newspaper}
                        size={64}
                        className="text-muted-foreground/30"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center">
                  {featuredPost.category && (
                    <Badge variant="secondary" className="mb-4 w-fit">
                      {featuredPost.category.title}
                    </Badge>
                  )}

                  <h2 className="text-foreground group-hover:text-primary text-2xl font-bold tracking-tight transition-colors sm:text-3xl lg:text-4xl">
                    {featuredPost.title}
                  </h2>

                  {featuredPost.excerpt && (
                    <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  )}

                  <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={UserIcon} size={16} />
                      <span>{featuredPost.author.name ?? "DigiInsta Team"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={Calendar03Icon} size={16} />
                      <span>{formatDate(featuredPost.createdAt)}</span>
                    </div>
                  </div>

                  <Button className="mt-6 w-fit" variant="outline">
                    Read Article
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {regularPosts.length === 0 && !featuredPost ? (
            <div className="py-16 text-center">
              <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <HugeiconsIcon icon={Newspaper} size={32} className="text-muted-foreground" />
              </div>
              <h2 className="text-foreground text-xl font-semibold">No Posts Yet</h2>
              <p className="text-muted-foreground mt-2">
                Check back soon for tips, guides, and insights.
              </p>
              <Button asChild className="mt-6">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-foreground text-2xl font-bold">Latest Posts</h2>
                <p className="text-muted-foreground mt-1">
                  Stay up to date with our latest articles
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/blog/${post.slug}`} className="block">
                      {/* Image */}
                      <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-xl">
                        {post.featuredImage?.url ? (
                          <Image
                            src={post.featuredImage.url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                            <HugeiconsIcon
                              icon={Newspaper}
                              size={40}
                              className="text-muted-foreground/30"
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="mt-4">
                        {post.category && (
                          <Badge variant="secondary" className="mb-2">
                            {post.category.title}
                          </Badge>
                        )}

                        <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                          <span>{post.author.name ?? "DigiInsta Team"}</span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-muted/30 border-t py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-foreground text-2xl font-bold">Stay Updated</h2>
            <p className="text-muted-foreground mt-2">
              Get the latest tips and insights delivered to your inbox.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
