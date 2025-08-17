import { getPublicCatalog } from "@/actions/public/products"
// import { HomeCatalog } from "@/components/public/home-catalog"

interface CategoryPageProps { params: Promise<{ slug: string }> }

export default async function CategoryPage({ params }: CategoryPageProps) {
  await params
  const catalog = await getPublicCatalog()
  if (catalog.error || !catalog.data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">{catalog.error ?? "Failed to load catalog."}</p>
      </div>
    )
  }

  // const category = catalog.data.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase())
  return (
    // <HomeCatalog
    //   products={catalog.data.products}
    //   categories={catalog.data.categories}
    //   initialCategoryId={category?.id}
    // />
    <p> Category Page</p>
  )
}
