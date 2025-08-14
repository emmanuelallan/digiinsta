"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/types/categories"
import type { Product } from "@/types/products"
import { CheckoutButton } from "@/components/public/checkout-button"

interface PublicProduct extends Product {
  categories: Pick<Category, "id" | "title" | "slug">[]
}

export function HomeCatalog({
  products,
  categories,
  initialCategoryId,
}: {
  products: PublicProduct[]
  categories: Category[]
  initialCategoryId?: string
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId ?? "all")

  const categoryTabs = useMemo(
    () => [{ id: "all", title: "All" }, ...categories.map((c) => ({ id: c.id, title: c.title }))],
    [categories],
  )

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inCategory =
        selectedCategory === "all" || (p.category_ids ?? []).includes(selectedCategory)
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        query.length === 0 ||
        p.title.toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query)
      return inCategory && matchesQuery
    })
  }, [products, selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif font-bold text-5xl text-foreground mb-4">Digital products, beautifully crafted</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Clean design, clear pricing, instant delivery. Explore our curated selection.
          </p>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search products..."
                className="pl-12 pr-4 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={selectedCategory === c.id ? "default" : "outline"}
                className={selectedCategory === c.id ? "" : "bg-transparent"}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Search className="h-14 w-14 mx-auto" />
              </div>
              <h3 className="font-serif font-semibold text-xl">No products found</h3>
              <p className="text-muted-foreground mt-2">Try a different search or category.</p>
              <div className="mt-6">
                <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all") }}>Clear filters</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p) => {
                const priceFormatted = typeof p.price === "number" ? (p.price / 100).toFixed(2) : undefined
                return (
                  <Card key={p.id} className="group hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img
                        src={p.thumb_url || "/placeholder.svg"}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {p.categories.slice(0, 2).map((c) => (
                            <Badge key={c.id} variant="secondary" className="text-xs">{c.title}</Badge>
                          ))}
                        </div>
                        {priceFormatted && (
                          <span className="font-semibold">${priceFormatted}</span>
                        )}
                      </div>
                      <h3 className="font-serif font-semibold text-lg line-clamp-2">{p.title}</h3>
                      {p.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <Link href={`/products/${p.id}`}>
                          <Button variant="outline" size="sm">Details</Button>
                        </Link>
                        <CheckoutButton productId={p.id} className="bg-primary hover:bg-primary/90" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
