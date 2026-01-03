import { getEditorsPicks } from "@/lib/storefront";
import { ProductTray } from "./ProductTray";

interface EditorsPickProps {
  className?: string;
}

export async function EditorsPick({ className }: EditorsPickProps) {
  const products = await getEditorsPicks(8);

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
