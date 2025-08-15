import { PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="h-24 grid-layout items-center bg-secondary">
      <div className="flex justify-between content-container">
        <Link href="/admin/dashboard" className="flex items-center">
          <Image src="/images/icons/logo.svg" alt="logo image" width={90} height={50} />
        </Link>

        <div className="flex items-center space-x-8">
          <ThemeToggle />

          <Button className="text-sm cursor-pointer h-12 min-w-24 py-4 !px-6 inline-flex rounded uppercase whitespace-nowrap outline-0 border-0 items-center text-center gap-2" asChild>
          <Link href="/admin/products/new">
            <PackagePlus strokeWidth={1.5} size={15} />
            <span>
              Add Product
            </span>
          </Link>
        </Button>
        </div>

      </div>

    </header>
  )
}
