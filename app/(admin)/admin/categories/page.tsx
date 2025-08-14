"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Loader, Grid3X3, List, MoreHorizontal, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getCategories, deleteCategory } from "@/actions/admin/categories"
import type { Category } from "@/types/categories"
import { toast } from "sonner"

type ViewMode = "list" | "grid"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

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
                    <span>Created {new Date(category.created_at).toLocaleDateString()}</span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                  <DropdownMenuContent align="end" className="w-48">
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
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCategories.map((category) => (
        <Card key={category.id} className="group border shadow-none transition-all duration-300 overflow-hidden">
          {category.image_url ? (
            <div className="aspect-video overflow-hidden relative">
              <img
                src={category.image_url}
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center border-b">
              <div className="text-center space-y-2">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <p className="text-xs text-muted-foreground">No image</p>
              </div>
            </div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                  {category.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md">
                    /{category.slug}
                  </span>
                  <Badge 
                    variant={category.status === "active" ? "default" : "secondary"} 
                    className="text-xs px-2 py-1 font-medium"
                  >
                    {category.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Created {new Date(category.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEditCategory(category)}
                  className="h-8 px-3 border-border bg-background hover:bg-muted/50"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setDeletingCategory(category)}
                  className="h-8 px-3 border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
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
        <div className="sm:w-60 w-full">
          <h1 className="font-medium sm:text-2xl leading-6 text-xl truncate">Categories</h1>
          <span className="block sm:text-base mt-1 text-sm text-muted-foreground">Manage your product categories</span>
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

      {/* Search and View Toggle */}
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium mr-2">View:</span>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-10 px-4 flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-10 px-4 flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Grid
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === "list" ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border shadow-noen animate-pulse overflow-hidden">
                <div className="aspect-video bg-muted" />
                <CardHeader className="pb-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-4 bg-muted rounded w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-16 bg-muted rounded" />
                      <div className="h-8 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <>
          {filteredCategories.length > 0 ? (
            viewMode === "list" ? renderListView() : renderGridView()
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
                    className="mt-6 h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent className="border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.title}"? This action cannot be undone.
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
