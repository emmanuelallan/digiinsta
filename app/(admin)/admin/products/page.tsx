"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Search, ImageIcon, ExternalLink, Package, Trash2, MoreHorizontal, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductForm } from "@/components/admin/product-form"

import { getProductsSplit, deleteProduct, getManagedBundles, deleteBundle, getLemonProductsNotInSupabase } from "@/actions/admin/products"
import type { LemonProduct, Product, Bundle } from "@/types/products"
import { toast } from "sonner"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [editingLemonProduct, setEditingLemonProduct] = useState<LemonProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [managed, setManaged] = useState<Product[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [unmanaged, setUnmanaged] = useState<LemonProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingBundle, setDeletingBundle] = useState<Bundle | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAll = async () => {
    setIsLoading(true)
    const [splitRes, bundlesRes] = await Promise.all([
      getProductsSplit(),
      getManagedBundles()
    ])
    if (splitRes.error) toast.error(splitRes.error)
    if (bundlesRes.error) toast.error(bundlesRes.error)
    setManaged(splitRes.data?.managed ?? [])
    setBundles(bundlesRes.data ?? [])
    setUnmanaged(splitRes.data?.unmanaged ?? [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filteredManaged = managed.filter((p) =>
    [p.title, p.slug].some((t) => t?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredUnmanaged = unmanaged.filter((p) =>
    [p.attributes.name, p.attributes.slug].some((t) => t?.toLowerCase().includes(searchTerm.toLowerCase())),
  )

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

  const openFormForBundle = (b: Bundle) => {
    setEditingLemonProduct(null)
    setEditingProduct(null)
    setEditingBundle(b)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
    setEditingBundle(null)
    setEditingLemonProduct(null)
  }

  const handleFormSuccess = () => {
    closeForm()
    setIsRefreshing(true)
    fetchAll().finally(() => setIsRefreshing(false))
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return

    const { error } = await deleteProduct(deletingProduct.id)

    if (error) {
      toast.error(error)
      return
    }

    toast.success("Product deleted successfully")
    setDeletingProduct(null)
    fetchAll()
  }

  const handleDeleteBundle = async () => {
    if (!deletingBundle) return

    const { error } = await deleteBundle(deletingBundle.id)

    if (error) {
      toast.error(error)
      return
    }

    toast.success("Bundle deleted successfully")
    setDeletingBundle(null)
    fetchAll()
  }

  const syncLemonProducts = async () => {
    setIsSyncing(true)
    try {
      const { data, error } = await getLemonProductsNotInSupabase()
      if (error) {
        toast.error(error)
        return
      }
      setUnmanaged(data ?? [])
      toast.success("Lemon Squeezy products refreshed")
    } catch {
      toast.error("Failed to sync Lemon Squeezy products")
    } finally {
      setIsSyncing(false)
    }
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
                <Badge variant="secondary" className="text-xs">Lemon Squeezy</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md">/{lp.attributes.slug}</span>
                {lp.attributes.price != null && <span>${(lp.attributes.price / 100).toFixed(2)}</span>}
                <span>•</span>
                <span>{lp.attributes.status}</span>
              </div>
              {lp.attributes.description && (
                <p className="text-sm text-muted-foreground max-w-md overflow-hidden text-ellipsis whitespace-nowrap">{lp.attributes.description.replace(/<[^>]*>/g, '')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lp.attributes.buy_now_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={lp.attributes.buy_now_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => openFormForLemon(lp)}>
              <Plus className="h-4 w-4 mr-1" />
              Add to Store
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
            {p.images && p.images.length > 0 ? (
              <div className="h-16 w-16 overflow-hidden rounded-xl border bg-muted/20">
                <img
                  src={p.images[0].image_url}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                <Badge
                  variant={p.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {p.status}
                </Badge>
                {p.is_physical && (
                  <Badge variant="outline" className="text-xs">Physical</Badge>
                )}
                {p.images && p.images.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {p.images.length} image{p.images.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md">/{p.slug}</span>
                {p.price != null && <span>${(p.price / 100).toFixed(2)}</span>}
                <span>•</span>
                <span>Created {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</span>
              </div>
              {p.description && (
                <p className="text-sm text-muted-foreground max-w-md overflow-hidden text-ellipsis whitespace-nowrap">{p.description}</p>
              )}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {p.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{p.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openFormForManaged(p)}
              className="h-9 px-3 border-border bg-background hover:bg-muted/50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => openFormForManaged(p)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeletingProduct(p)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBundleCard = (b: Bundle) => (
    <Card key={b.id} className="border shadow-none transition-all duration-200">
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {b.hero_image_url ? (
              <div className="h-16 w-16 overflow-hidden rounded-xl border bg-muted/20">
                <img
                  src={b.hero_image_url}
                  alt={b.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
                <Badge
                  variant={b.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {b.status}
                </Badge>
                <Badge variant="outline" className="text-xs">Bundle</Badge>
                {b.hero_image_url && (
                  <Badge variant="outline" className="text-xs">Has Image</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded-md">/{b.slug}</span>
                {b.price != null && <span>${(b.price / 100).toFixed(2)}</span>}
                <span>•</span>
                <span>Created {b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}</span>
              </div>
              {b.tagline && (
                <p className="text-sm text-muted-foreground max-w-md overflow-hidden text-ellipsis whitespace-nowrap">{b.tagline}</p>
              )}
              {b.description && (
                <p className="text-sm text-muted-foreground max-w-md overflow-hidden text-ellipsis whitespace-nowrap">{b.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openFormForBundle(b)}
              className="h-9 px-3 border-border bg-background hover:bg-muted/50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => openFormForBundle(b)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Bundle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeletingBundle(b)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Bundle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderLemonSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="border shadow-none animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-muted rounded w-32" />
                    <div className="h-5 bg-muted rounded w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-16 bg-muted rounded" />
                <div className="h-9 w-16 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderManagedSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="border shadow-none animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-muted rounded w-32" />
                    <div className="h-5 bg-muted rounded w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-16 bg-muted rounded" />
                <div className="h-9 w-9 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderBundleSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, index) => (
        <Card key={index} className="border shadow-none animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-muted rounded w-32" />
                    <div className="h-5 bg-muted rounded w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-16 bg-muted rounded" />
                <div className="h-9 w-9 bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center rounded-lg border p-6 sm:flex-wrap flex-nowrap">
        <div className="sm:w-80 w-full">
          <h1 className="font-medium sm:text-2xl leading-6 text-xl truncate">Products</h1>
          <span className="block sm:text-base mt-1 text-sm text-muted-foreground">Manage products from Lemon Squeezy</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/20 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={syncLemonProducts}
          disabled={isSyncing}
          className="h-10 px-4 border-border bg-background hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Lemon Squeezy'}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          {/* Unmanaged Products Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Available from Lemon Squeezy</h2>
              <Badge variant="secondary" className="text-sm">0 products</Badge>
            </div>
            {renderLemonSkeleton()}
          </div>

          {/* Managed Products Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Store Products</h2>
              <Badge variant="default" className="text-sm">0 products</Badge>
            </div>
            {renderManagedSkeleton()}
          </div>

          {/* Bundles Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Bundles</h2>
              <Badge variant="default" className="text-sm">0 bundles</Badge>
            </div>
            {renderBundleSkeleton()}
          </div>
        </div>
      ) : (
        <>
          {/* Unmanaged Products */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Available from Lemon Squeezy</h2>
              <Badge variant="secondary" className="text-sm">{filteredUnmanaged.length} products</Badge>
            </div>
            {isSyncing ? (
              renderLemonSkeleton()
            ) : filteredUnmanaged.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">All products are managed</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Great job! All available products from Lemon Squeezy have been added to your store.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUnmanaged.map(renderLemonCard)}
              </div>
            )}
          </div>

          {/* Managed Products */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Store Products</h2>
              <Badge variant="default" className="text-sm">{filteredManaged.length} products</Badge>
            </div>
            {isRefreshing ? (
              renderManagedSkeleton()
            ) : filteredManaged.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start building your store by adding products from Lemon Squeezy above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredManaged.map(renderManagedCard)}
              </div>
            )}
          </div>

          {/* Bundles */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Bundles</h2>
              <Badge variant="default" className="text-sm">{bundles.length} bundles</Badge>
            </div>
            {isRefreshing ? (
              renderBundleSkeleton()
            ) : bundles.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No bundles yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start building your bundles by adding products from Lemon Squeezy above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bundles.map(renderBundleCard)}
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="min-w-7xl w-full border-0 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {editingProduct ? "Edit Product" : "Add Product to Store"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            lemonProduct={editingLemonProduct || undefined}
            product={editingProduct || undefined}
            bundle={editingBundle || undefined}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bundle Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBundle} onOpenChange={() => setDeletingBundle(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bundle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingBundle?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBundle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
