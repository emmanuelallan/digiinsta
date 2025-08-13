"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Package,
  Tags,
  Building2,
  Percent,
  Inbox,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/actions/admin/auth"
import { useState } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Bundles",
    href: "/admin/bundles",
    icon: Building2,
  },
  {
    name: "Discounts",
    href: "/admin/discounts",
    icon: Percent,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: Inbox,
  },
]

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function SideBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const result = await signOutAction()
      if (result?.success) {
        router.push("/admin/auth/login")
      } else if (result?.error) {
        console.error("Sign out error:", result.error)
        // Still redirect to login even if there's an error
        router.push("/admin/auth/login")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Redirect to login on any error
      router.push("/admin/auth/login")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <aside className="flex-1 max-w-60 ml-6">
      <menu className="bg-secondary rounded-md list-none">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <div key={index} className="relative">
              <Link 
                href={item.href} 
                className={`${isActive ? 'text-foreground' : 'text-secondary-foreground hover:bg-muted/20'} items-center border-b cursor-pointer flex flex-wrap text-sm h-[90px] leading-4 py-8 pr-6 pl-8 transition-colors duration-75 no-underline`}
              >
                <span className="items-center flex mr-4">
                  <item.icon size={24} strokeWidth={1.5} />
                </span>
                <span>
                  {item.name}
                </span>
              </Link>
              {isActive && (
                <span className="bg-primary h-[90px] absolute right-0 top-0 w-0.5 will-change-transform transition-transform duration-100 delay-75 transform-[translateY(0)]"></span>
              )}
            </div>
          )
        })}

        {secondaryNavigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <div key={index} className="relative">
              <Link 
                href={item.href} 
                className={`${isActive ? 'text-foreground' : 'text-secondary-foreground hover:bg-muted/20'} items-center border-b cursor-pointer flex flex-wrap text-sm h-[90px] leading-4 py-8 pr-6 pl-8 transition-colors duration-75 no-underline`}
              >
                <span className="items-center flex mr-4">
                  <item.icon size={24} strokeWidth={1.5} />
                </span>
                <span>
                  {item.name}
                </span>
              </Link>
              {isActive && (
                <span className="bg-primary h-[90px] absolute right-0 top-0 w-0.5 will-change-transform transition-transform duration-100 delay-75 transform-[translateY(0)]"></span>
              )}
            </div>
          )
        })}

        <div className="items-center rounded-none border-none bg-secondary cursor-pointer flex flex-wrap text-sm h-[90px] leading-4 transition-colors duration-75 no-underline w-full">
          <Button
            type="button"
            variant="ghost"
            className="w-full h-full hover:!bg-muted/20 hover:text-secondary-foreground py-8 pr-6 pl-8 justify-start text-secondary-foreground cursor-pointer"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <span className="items-center flex mr-4">
              {isSigningOut ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut size={24} strokeWidth={1.5} />
              )}
            </span>
            <span>
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </span>
          </Button>
        </div>
      </menu>
    </aside>
  )
}
