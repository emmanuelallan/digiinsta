"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function CartRibbon() {
  const itemCount = 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href="/cart"
          aria-label={`Cart, ${itemCount} items`}
          className="relative block group transition-colors w-11 h-11 rounded-lg border border-border bg-secondary hover:bg-secondary/80"
        >
          <span className="flex items-center justify-center w-11 h-11 text-xs font-medium">
            <ShoppingBag className="w-6 h-6 text-foreground" />
            <span className="items-qty group-hover:font-semibold absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] leading-none font-medium w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>Coming soon</TooltipContent>
    </Tooltip>
  )
}


