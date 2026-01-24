"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Logged out successfully')
        router.push('/admin')
      } else {
        toast.error('Failed to logout')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('An error occurred while logging out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Don't show header on login page
  if (pathname === '/admin') {
    return null
  }

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>
      
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-semibold">
                Lemon Squeezy Admin
              </h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin/dashboard')}
                  className={pathname === '/admin/dashboard' ? 'bg-muted' : ''}
                  aria-current={pathname === '/admin/dashboard' ? 'page' : undefined}
                >
                  Dashboard
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Logout from admin dashboard"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </nav>
        </div>
      </header>
    </>
  )
}
