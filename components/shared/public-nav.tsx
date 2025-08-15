import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from "@/components/ui/navigation-menu"
import Link from "next/link"
import { getPublicNavigationData } from "@/actions/public/categories"

export default async function PublicNav() {
  const { categories, bundles } = await getPublicNavigationData()

  return (
    <div className="border-b bg-background/70">
      <div className="container max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <NavigationMenu className="w-full justify- justify-self-center" viewport>
          <NavigationMenuList className="justify-start gap-2 overflow-x-auto">
            <NavigationMenuItem>
              <NavigationMenuLink href="/" className="px-4 py-2 text-sm font-medium">New</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/products?sort=bestsellers" className="px-4 py-2 text-sm font-medium">Bestsellers</NavigationMenuLink>
            </NavigationMenuItem>

            {categories.map((cat) => (
              <NavigationMenuItem key={cat.id}>
                {cat.subcategories.length > 0 ? (
                  <NavigationMenuTrigger className="text-sm">
                    {cat.title}
                  </NavigationMenuTrigger>
                ) : (
                  <NavigationMenuLink href={`/categories/${cat.slug}`} className="px-4 py-2 text-sm font-medium">
                    {cat.title}
                  </NavigationMenuLink>
                )}
                {cat.subcategories.length > 0 && (
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-[min(100vw,60rem)] p-2">
                      <Link href={`/categories/${cat.slug}`} className="col-span-full">
                        <div className="rounded-md border p-3 hover:bg-accent transition-colors">
                          <p className="text-sm font-medium">View all in {cat.title}</p>
                        </div>
                      </Link>
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.id} href={`/categories/${cat.slug}?sub=${sub.slug}`}>
                          <div className="rounded-md border p-3 hover:bg-accent transition-colors">
                            <p className="text-sm font-medium">{sub.title}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                )}
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm">Bundles</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-2 w-[min(100vw,50rem)]">
                  <Link href="/bundles" className="sm:col-span-2 md:col-span-3">
                    <div className="rounded-md border p-3 hover:bg-accent transition-colors">
                      <p className="text-sm font-medium">Explore all Bundles</p>
                    </div>
                  </Link>
                  {bundles.map((b) => (
                    <Link key={b.id} href={`/bundles/${b.slug}`}>
                      <div className="rounded-md border p-3 hover:bg-accent transition-colors">
                        <p className="text-sm font-medium">{b.title}</p>
                        {b.tagline && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.tagline}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/custom-orders" className="px-4 py-2 text-sm font-medium">Custom Orders</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuIndicator />
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>
    </div>
  )
}


