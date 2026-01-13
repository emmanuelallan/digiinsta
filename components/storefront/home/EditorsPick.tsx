import { unstable_cache } from "next/cache";
import { getEditorsPicks } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";

interface EditorsPickProps {
  className?: string;
}

/**
 * Cached editor's picks fetching with collection tag
 * Validates: Requirements 2.3
 */
const getCachedEditorsPicks = () =>
  unstable_cache(
    async () => {
      return getEditorsPicks(8);
    },
    ["editors-picks"],
    {
      revalidate: 60, // 1 minute - reduced for fresher data
      tags: [COLLECTION_TAGS.editorsPicks, COLLECTION_TAGS.allProducts],
    }
  )();

export async function EditorsPick({ className }: EditorsPickProps) {
  const products = await getCachedEditorsPicks();

  return (
    <ProductTray
      title="Editor's Pick"
      subtitle="Handpicked favorites from our design team"
      products={products}
      viewAllHref="/products"
      className={className}
    />
  );
}
