import { getPublicCatalog } from "@/actions/public/products"
import { HomeCatalog } from "@/components/public/home-catalog"

export default async function HomePage() {
  const catalog = await getPublicCatalog()
  if (catalog.error || !catalog.data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">{catalog.error ?? "Failed to load catalog."}</p>
      </div>
    )
  }

  return <HomeCatalog products={catalog.data.products} categories={catalog.data.categories} />
}
