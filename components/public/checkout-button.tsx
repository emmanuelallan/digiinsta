"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CheckoutButton({ productId, className }: { productId: string; className?: string }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Failed to start checkout")
      }
      const url: string | undefined = json?.url
      if (url) {
        window.location.href = url
      } else {
        throw new Error("Checkout URL missing")
      }
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className={className} onClick={handleCheckout} disabled={loading}>
      {loading ? "Loading..." : "Buy Now"}
    </Button>
  )
}
