import { getPublicNavigationData } from "@/actions/public/categories"
import { HomeCatalog } from "@/components/public/home-catalog"

export default async function HomePage() {
  const { categories, error } = await getPublicNavigationData()
  
  if (error || !categories) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="font-serif text-2xl">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">{error ?? "Failed to load categories."}</p>
      </div>
    )
  }

  return <HomeCatalog categories={categories} />
}
