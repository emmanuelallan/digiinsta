"use client";

import { useState, useEffect, type RefObject } from "react";

interface UseElementVisibilityOptions {
  /** Threshold for intersection (0-1), default 0 */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
}

/**
 * Hook to detect when an element is visible in the viewport
 * Uses IntersectionObserver API for efficient visibility detection
 *
 * @param ref - RefObject pointing to the element to observe
 * @param options - Configuration options for the observer
 * @returns boolean indicating if the element is visible
 */
export function useElementVisibility(
  ref: RefObject<HTMLElement | null>,
  options: UseElementVisibilityOptions = {}
): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const { threshold = 0, rootMargin = "0px" } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: assume visible if no IntersectionObserver support
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin]);

  return isVisible;
}
