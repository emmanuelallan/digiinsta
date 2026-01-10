"use client";

/**
 * RefreshCacheButton - Custom Payload field component for manual cache refresh
 *
 * Provides a button in the product edit view sidebar to manually trigger
 * cache revalidation for the current document.
 *
 * Requirements: 4.3
 */

import { useState, useCallback } from "react";
import { useDocumentInfo, toast } from "@payloadcms/ui";

interface RefreshCacheButtonProps {
  path?: string;
}

/**
 * RefreshCacheButton Component
 *
 * A custom Payload field component that renders a button to manually
 * refresh the cache for the current document.
 */
export function RefreshCacheButton({ path: _path }: RefreshCacheButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const documentInfo = useDocumentInfo();

  const handleRefresh = useCallback(async () => {
    if (!documentInfo?.id || !documentInfo?.collectionSlug) {
      toast.error("Cannot refresh: Document not saved yet");
      return;
    }

    setIsLoading(true);

    try {
      // Get the slug from the document data
      const docData = documentInfo.initialData as { slug?: string } | undefined;
      const slug = docData?.slug;

      if (!slug) {
        toast.error("Cannot refresh: Document has no slug");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collection: documentInfo.collectionSlug,
          id: documentInfo.id,
          slug,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Cache refreshed successfully (${result.duration}ms)`);
      } else if (response.ok && !result.success) {
        toast.error(`Cache refresh failed: ${result.errors?.join(", ") ?? "Unknown error"}`);
      } else {
        toast.error(`Error: ${result.error ?? "Unknown error"}`);
      }
    } catch (error) {
      toast.error(
        `Failed to refresh cache: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [documentInfo]);

  // Don't render if document is not saved
  if (!documentInfo?.id) {
    return (
      <div style={styles.container}>
        <p style={styles.hint}>Save the document first to enable cache refresh</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isLoading}
        style={{
          ...styles.button,
          ...(isLoading ? styles.buttonDisabled : {}),
        }}
      >
        {isLoading ? (
          <>
            <span style={styles.spinner} />
            Refreshing...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={styles.icon}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Refresh Cache
          </>
        )}
      </button>
      <p style={styles.hint}>Force refresh the frontend cache for this item</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "0.75rem 0",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.625rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--theme-elevation-1000)",
    backgroundColor: "var(--theme-elevation-100)",
    border: "1px solid var(--theme-elevation-200)",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    width: "100%",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  icon: {
    flexShrink: 0,
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid var(--theme-elevation-300)",
    borderTopColor: "var(--theme-elevation-800)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  hint: {
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color: "var(--theme-elevation-500)",
    lineHeight: 1.4,
  },
};

export default RefreshCacheButton;
