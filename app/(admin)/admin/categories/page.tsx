"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, ChevronDown, ChevronRight, MoreHorizontal, ImageIcon } from "lucide-react"
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
import { CategoryForm } from "@/components/admin/category-form"
import { SubcategoryForm } from "@/components/admin/subcategory-form"
import { getCategories, deleteCategory, getSubcategoriesByCategory, deleteSubcategory } from "@/actions/admin/categories"
import type { Tables } from "@/types/supabase"
import { toast } from "sonner"

type Category = Tables<"categories">
type Subcategory = Tables<"subcategories">

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({})
  const [subDialog, setSubDialog] = useState<{ open: boolean; categoryId: string | null; sub?: Subcategory }>({ open: false, categoryId: null })

  const fetchCategories = async () => {
    setIsLoading(true)
    const { data, error } = await getCategories()

    if (error) {
      toast.error(error)
      return
    }

    if (data) {
      setCategories(data)
      setFilteredCategories(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = categories.filter(
      (category) =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCategories(filtered)
  }, [searchTerm, categories])

  const loadSubcategories = async (categoryId: string) => {
    const { data } = await getSubcategoriesByCategory(categoryId)
    setSubcategories((prev) => ({ ...prev, [categoryId]: data ?? [] }))
  }

  const toggleExpand = (categoryId: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [categoryId]: !prev[categoryId] }
      return next
    })
  }

  // Load subcategories when expanded state changes
  useEffect(() => {
    Object.entries(expanded).forEach(([categoryId, isExpanded]) => {
      if (isExpanded && !subcategories[categoryId]) {
        void loadSubcategories(categoryId)
      }
    })
  }, [expanded, subcategories])

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    const { error } = await deleteCategory(deletingCategory.id)

    if (error) {
      toast.error(error)
      return
    }

    toast.success("Category deleted successfully")
    setDeletingCategory(null)
    fetchCategories()
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
    fetchCategories()
  }

  const handleDeleteSubcategory = async (sub: Subcategory) => {
    const { error } = await deleteSubcategory(sub.id)
    if (error) {
      toast.error(error)
      return
    }
    toast.success("Subcategory deleted successfully")
    void loadSubcategories(sub.category_id)
  }

  const renderListView = () => (
    <div className="space-y-4">
      {filteredCategories.map((category) => (
        <Card key={category.id} className="border shadow-none transition-all duration-200">
          <CardContent className="px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {category.image_url ? (
                  <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-border bg-muted/20">
                    <img
                      src={category.image_url}
                      alt={category.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                    <Badge 
                      variant={category.status === "active" ? "default" : "secondary"} 
                      className="text-xs px-2 py-1 font-medium"
                    >
                      {category.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono bg-muted/50 px-2 py-1 rounded-md">/{category.slug}</span>
                    <span>•</span>
                    <span>Created {category.created_at ? new Date(category.created_at).toLocaleDateString() : "—"}</span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => toggleExpand(category.id)}>
                  {expanded[category.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditCategory(category)}
                  className="h-9 px-3 border-border bg-background hover:bg-muted/50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setSubDialog({ open: true, categoryId: category.id })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subcategory
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Category
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeletingCategory(category)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {expanded[category.id] && (
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Subcategories</h4>
                  <Button size="sm" variant="ghost" onClick={() => setSubDialog({ open: true, categoryId: category.id })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Subcategory
                  </Button>
                </div>
                <div className="mt-3 overflow-hidden rounded-md border">
                  <div className="grid grid-cols-12 bg-muted/40 text-xs font-medium px-3 py-2">
                    <div className="col-span-4">Title</div>
                    <div className="col-span-3">Slug</div>
                    <div className="col-span-3">Tagline</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <div>
                    {(subcategories[category.id] ?? []).map((sub) => (
                      <div key={sub.id} className="grid grid-cols-12 items-center px-3 py-2 border-t text-sm">
                        <div className="col-span-4 truncate">{sub.title}</div>
                        <div className="col-span-3 truncate font-mono">/{sub.slug}</div>
                        <div className="col-span-3 truncate text-muted-foreground">{sub.tagline ?? ""}</div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSubDialog({ open: true, categoryId: category.id, sub })}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSubcategory(sub)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(subcategories[category.id]?.length ?? 0) === 0 && (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">No subcategories yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
          <h1 className="font-medium sm:text-2xl leading-6 text-xl truncate">Categories</h1>
          <span className="block sm:text-base mt-1 text-sm text-muted-foreground">Manage categories and subcategories</span>
        </div>
        <Button
          type="button"
          className="inline-flex items-center gap-2 ml-auto h-12 min-w-24 py-4 !px-6 uppercase justify-center rounded border-0"
          onClick={handleCreateCategory}
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/20 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border shadow-none animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-muted rounded-xl" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-5 bg-muted rounded w-32" />
                        <div className="h-5 bg-muted rounded w-16" />
                      </div>
                      <div className="flex items-center gap-4">
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
      ) : (
        <>
          {filteredCategories.length > 0 ? (
            renderListView()
          ) : (
            filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? "No categories found" : "No categories yet"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm
                    ? "Try adjusting your search terms or browse all categories."
                    : "Get started by creating your first category to organize your products."}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleCreateCategory}
                    variant="secondary"
                    className="mt-6 h-11 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Category
                  </Button>
                )}
              </div>
            )
          )}
        </>
      )}

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Subcategory Form Dialog */}
      <Dialog open={subDialog.open} onOpenChange={(open) => setSubDialog({ open, categoryId: null })}>
        <DialogContent className="max-w-2xl border-0 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {subDialog.sub ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
          </DialogHeader>
          {subDialog.categoryId && (
            <SubcategoryForm
              categoryId={subDialog.categoryId}
              subcategory={subDialog.sub}
              onSuccess={() => {
                setSubDialog({ open: false, categoryId: null })
                void loadSubcategories(subDialog.categoryId!)
              }}
              onCancel={() => setSubDialog({ open: false, categoryId: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
