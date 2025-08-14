"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Edit, Search, Grid3X3, List, ImageIcon, ExternalLink, Loader, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { ProductForm } from "@/components/admin/product-form"
import { getCategories } from "@/actions/admin/categories"
import { getProductsSplit } from "@/actions/admin/products"
import type { LemonProduct, Product } from "@/types/products"

 type ViewMode = "list" | "grid"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingLemonProduct, setEditingLemonProduct] = useState<LemonProduct | null>(null)

  const [managed, setManaged] = useState<Product[]>([])
  const [unmanaged, setUnmanaged] = useState<LemonProduct[]>([])
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    const [splitRes, catsRes] = await Promise.all([getProductsSplit(), getCategories()])
    if (splitRes.error) toast.error(splitRes.error)
    if (catsRes.error) toast.error(catsRes.error)
    setManaged(splitRes.data?.managed ?? [])
    setUnmanaged(splitRes.data?.unmanaged ?? [])
    setCategories((catsRes.data ?? []).map((c) => ({ id: c.id, title: c.title })))
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filteredManaged = useMemo(() => {
    return managed.filter((p) =>
      [p.title, p.slug].some((t) => t?.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [managed, searchTerm])

  const filteredUnmanaged = useMemo(() => {
    return unmanaged.filter((p) =>
      [p.attributes.name, p.attributes.slug].some((t) => t?.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [unmanaged, searchTerm])

  const openFormForLemon = (lp: LemonProduct) => {
    setEditingProduct(null)
    setEditingLemonProduct(lp)
    setIsFormOpen(true)
  }

  const openFormForManaged = (p: Product) => {
    setEditingLemonProduct(null)
    setEditingProduct(p)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
    setEditingLemonProduct(null)
  }

  const handleFormSuccess = () => {
    closeForm()
    fetchAll()
  }

  const renderLemonCard = (lp: LemonProduct) => (
    <Card key={lp.id} className="border shadow-none transition-all duration-200">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {lp.attributes.thumb_url ? (
              <div className="h-16 w-16 overflow-hidden rounded-xl border bg-muted/20">
                <img src={lp.attributes.thumb_url} alt={lp.attributes.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{lp.attributes.name}</h3>
                <Badge variant="secondary" className="text-xs">Lemon</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md">/{lp.attributes.slug}</span>
                {lp.attributes.price != null && <span>{(lp.attributes.price / 100).toFixed(2)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lp.attributes.buy_now_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={lp.attributes.buy_now_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Checkout
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => openFormForLemon(lp)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderManagedCard = (p: Product) => (
    <Card key={p.id} className="border shadow-none transition-all duration-200">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {p.thumb_url ? (
              <div className="h-16 w-16 overflow-hidden rounded-xl border bg-muted/20">
                <img src={p.thumb_url} alt={p.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                <Badge className="text-xs">Managed</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md">/{p.slug}</span>
                {p.price != null && <span>{(p.price / 100).toFixed(2)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openFormForManaged(p)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center rounded-lg border p-6 sm:flex-wrap flex-nowrap">
        <div className="sm:w-60 w-full">
          <h1 className="font-medium sm:text-2xl leading-6 text-xl truncate">Products</h1>
          <span className="block sm:text-base mt-1 text-sm text-muted-foreground">Edit and manage products from Lemon Squeezy</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 bg-muted/20 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium mr-2">View:</span>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="h-10 px-4 flex items-center gap-2">
            <List className="w-4 h-4" />
            List
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")} className="h-10 px-4 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Grid
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader className="animate-spin w-4 h-4" /> Loading...</div>
      ) : (
        <>
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-muted-foreground">Unmanaged (from Lemon Squeezy)</h2>
            {filteredUnmanaged.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products are managed.</p>
            ) : viewMode === "list" ? (
              <div className="space-y-4">{filteredUnmanaged.map(renderLemonCard)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredUnmanaged.map(renderLemonCard)}</div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-medium text-muted-foreground">Managed (saved to Supabase)</h2>
            {filteredManaged.length === 0 ? (
              <p className="text-sm text-muted-foreground">No managed products yet.</p>
            ) : viewMode === "list" ? (
              <div className="space-y-4">{filteredManaged.map(renderManagedCard)}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">{filteredManaged.map(renderManagedCard)}</div>
            )}
          </div>
        </>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">{editingProduct ? "Edit Product" : "Save Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            lemonProduct={editingLemonProduct || undefined}
            product={editingProduct || undefined}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
