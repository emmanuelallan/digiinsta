"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Newspaper, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/storefront/blog";

interface RelatedPostsProps {
  /** Array of related blog posts to display */
  posts: BlogPost[];
  /** Section title */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Link to view all posts */
  viewAllHref?: string;
  /** Label for view all link */
  viewAllLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Card variant */
  variant?: "default" | "compact" | "horizontal";
  /** Maximum number of posts to display */
  maxPosts?: number;
}

/**
 * Format date string to human-readable format
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * RelatedPosts Component
 *
 * Displays a grid of related blog posts from the same category or with similar tags.
 * Used on blog post pages to encourage further reading and improve internal linking.
 *
 * @example
 * ```tsx
 * <RelatedPosts
 *   posts={relatedPosts}
 *   title="Related Posts"
 *   viewAllHref="/blog"
 * />
 * ```
 */
export function RelatedPosts({
  posts,
  title = "Related Posts",
  subtitle,
  viewAllHref,
  viewAllLabel = "View All Posts",
  className,
  variant = "default",
  maxPosts = 3,
}: RelatedPostsProps) {
  // Don't render if no posts
  if (!posts || posts.length === 0) {
    return null;
  }

  // Limit posts to maxPosts
  const displayPosts = posts.slice(0, maxPosts);

  return (
    <section className={cn("py-12 lg:py-16", className)}>
      {/* Section Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {viewAllLabel}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>

      {/* Posts Grid */}
      {variant === "horizontal" ? (
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <HorizontalPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : variant === "compact" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayPosts.map((post) => (
            <CompactPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => (
            <DefaultPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Default post card with image, category, title, and date
 */
function DefaultPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group">
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
              <HugeiconsIcon icon={Newspaper} size={40} className="text-muted-foreground/30" />
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
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{post.excerpt}</p>
          )}

          <div className="text-muted-foreground mt-2 text-xs">{formatDate(post.createdAt)}</div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Compact post card for sidebar or smaller spaces
 */
function CompactPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image */}
        <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
          {post.featuredImage?.url ? (
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
              <HugeiconsIcon icon={Newspaper} size={24} className="text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3">
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-medium transition-colors">
            {post.title}
          </h3>
          <div className="text-muted-foreground mt-1 text-xs">{formatDate(post.createdAt)}</div>
        </div>
      </Link>
    </article>
  );
}

/**
 * Horizontal post card for list layouts
 */
function HorizontalPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="hover:border-primary/50 flex gap-4 rounded-lg border p-4 transition-colors"
      >
        {/* Image */}
        <div className="bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          {post.featuredImage?.url ? (
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="from-primary/10 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
              <HugeiconsIcon icon={Newspaper} size={20} className="text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {post.category && (
            <Badge variant="secondary" className="mb-1 text-xs">
              {post.category.title}
            </Badge>
          )}
          <h3 className="text-foreground group-hover:text-primary line-clamp-1 font-medium transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">
            {post.excerpt ?? "Read more..."}
          </p>
          <div className="text-muted-foreground mt-1 text-xs">{formatDate(post.createdAt)}</div>
        </div>
      </Link>
    </article>
  );
}

export default RelatedPosts;
