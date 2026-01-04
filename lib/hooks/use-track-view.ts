"use client";

import { useEffect, useRef } from "react";
import {
  trackProductView,
  trackBundleView,
  trackGoal,
  ANALYTICS_GOALS,
} from "@/components/analytics";

/**
 * Hook to track product view on page load
 * Only tracks once per page load
 */
export function useTrackProductView(
  product: {
    id: number | string;
    title: string;
    price?: number;
    category?: string;
  } | null
) {
  const tracked = useRef(false);

  useEffect(() => {
    if (product && !tracked.current) {
      tracked.current = true;
      trackProductView(product);
    }
  }, [product]);
}

/**
 * Hook to track bundle view on page load
 * Only tracks once per page load
 */
export function useTrackBundleView(
  bundle: {
    id: number | string;
    title: string;
    price?: number;
    product_count?: number;
  } | null
) {
  const tracked = useRef(false);

  useEffect(() => {
    if (bundle && !tracked.current) {
      tracked.current = true;
      trackBundleView(bundle);
    }
  }, [bundle]);
}

/**
 * Hook to track category view on page load
 */
export function useTrackCategoryView(
  category: {
    slug: string;
    title: string;
  } | null
) {
  const tracked = useRef(false);

  useEffect(() => {
    if (category && !tracked.current) {
      tracked.current = true;
      trackGoal(ANALYTICS_GOALS.CATEGORY_VIEW, {
        category_slug: category.slug,
        category_title: category.title,
      });
    }
  }, [category]);
}

/**
 * Hook to track blog post view
 */
export function useTrackBlogView(
  post: {
    slug: string;
    title: string;
  } | null
) {
  const tracked = useRef(false);

  useEffect(() => {
    if (post && !tracked.current) {
      tracked.current = true;
      trackGoal(ANALYTICS_GOALS.BLOG_VIEW, {
        post_slug: post.slug,
        post_title: post.title,
      });
    }
  }, [post]);
}
