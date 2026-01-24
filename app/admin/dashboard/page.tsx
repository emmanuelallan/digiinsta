'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import Image from 'next/image';

interface Product {
  id: string;
  lemonSqueezyId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  isEnhanced: boolean;
}

const PRODUCTS_PER_PAGE = 20;

function stripHtml(html: string | null): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').substring(0, 100);
}

function ProductTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-[120px]">Price</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4, 5].map((i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="w-16 h-16 rounded" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-9 w-16" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'unsynced' | 'synced'>('unsynced');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products by sync status
  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      currentTab === 'unsynced' ? !product.isEnhanced : product.isEnhanced
    );
  }, [products, currentTab]);

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const unsyncedCount = useMemo(() => 
    products.filter(p => !p.isEnhanced).length, 
    [products]
  );
  
  const syncedCount = useMemo(() => 
    products.filter(p => p.isEnhanced).length, 
    [products]
  );

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('An error occurred while loading products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [currentTab]);

  const handleResyncProducts = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch('/api/products/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Sync completed! ${data.newProductsCount} new product(s) added, ${data.skippedProductsCount} skipped.`
        );
        // Refresh the product list and reset to first page
        await fetchProducts();
        setCurrentPage(1);
      } else {
        const errorMessage = data.errors?.join(', ') || data.error || 'Sync failed';
        toast.error(`Sync failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      toast.error('An error occurred while syncing products');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/admin/products/${productId}`);
  };

  const handleProductDelete = async (productId: string, productName: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis will permanently delete:\n- Product data\n- Uploaded images\n- Taxonomy associations\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsSyncing(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product deleted successfully!');
        // Refresh the product list
        await fetchProducts();
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred while deleting the product');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteAll = async (type: 'all' | 'unsynced' | 'synced') => {
    const typeLabel = type === 'all' ? 'all products' : type === 'unsynced' ? 'all unsynced products' : 'all synced products';
    const count = type === 'all' ? products.length : type === 'unsynced' ? unsyncedCount : syncedCount;

    if (count === 0) {
      toast.info(`No ${typeLabel} to delete`);
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${typeLabel}?\n\nThis will permanently delete ${count} product(s) including:\n- Product data\n- Uploaded images\n- Taxonomy associations\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsSyncing(true);

    try {
      const response = await fetch(`/api/products/delete-all?type=${type}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || `Deleted ${data.deletedCount} product(s)`);
        // Refresh the product list
        await fetchProducts();
      } else {
        toast.error(data.error || 'Failed to delete products');
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('An error occurred while deleting products');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Product Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage and enhance your Lemon Squeezy products
              </p>
            </div>
            <Button
              onClick={handleResyncProducts}
              disabled={isSyncing}
              aria-label="Resync products from Lemon Squeezy"
            >
              {isSyncing ? 'Syncing...' : 'Resync Products'}
            </Button>
          </div>
        </div>

        {/* Screen reader announcement for sync status */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {isSyncing && 'Syncing products...'}
          {isLoading && 'Loading products...'}
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <ProductTableSkeleton />
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Products Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t synced any products yet. Click the &quot;Resync Products&quot; button above to fetch products from Lemon Squeezy.
              </p>
              <Button onClick={handleResyncProducts} disabled={isSyncing}>
                {isSyncing ? 'Syncing...' : 'Sync Products Now'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'unsynced' | 'synced')}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="unsynced">
                      Unsynced ({unsyncedCount})
                    </TabsTrigger>
                    <TabsTrigger value="synced">
                      Synced ({syncedCount})
                    </TabsTrigger>
                  </TabsList>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAll(currentTab)}
                    disabled={isSyncing || filteredProducts.length === 0}
                  >
                    Delete All {currentTab === 'unsynced' ? 'Unsynced' : 'Synced'}
                  </Button>
                </div>

                <TabsContent value="unsynced" className="mt-0">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No unsynced products. All products have been enhanced!</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead className="hidden md:table-cell">Description</TableHead>
                              <TableHead className="w-[120px]">Price</TableHead>
                              <TableHead className="w-[120px]">Status</TableHead>
                              <TableHead className="w-[140px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedProducts.map((product) => (
                              <TableRow key={product.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                    {product.images[0] ? (
                                      <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        No image
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {product.name}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-md">
                                  <div className="line-clamp-2">
                                    {stripHtml(product.description)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatPrice(product.price, product.currency)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    Not Enhanced
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleProductClick(product.id)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductDelete(product.id, product.name);
                                      }}
                                      disabled={isSyncing}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="synced" className="mt-0">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No synced products yet. Start enhancing products to see them here!</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead className="hidden md:table-cell">Description</TableHead>
                              <TableHead className="w-[120px]">Price</TableHead>
                              <TableHead className="w-[120px]">Status</TableHead>
                              <TableHead className="w-[140px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedProducts.map((product) => (
                              <TableRow key={product.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                    {product.images[0] ? (
                                      <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                        No image
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {product.name}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-md">
                                  <div className="line-clamp-2">
                                    {stripHtml(product.description)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatPrice(product.price, product.currency)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="default">
                                    Enhanced
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleProductClick(product.id)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductDelete(product.id, product.name);
                                      }}
                                      disabled={isSyncing}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                          />
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
