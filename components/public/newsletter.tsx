"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Mail, Loader2 } from "lucide-react"
import { subscribeToNewsletter } from "@/actions/public/newsletter"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setError("")
    setSuccess("")

    startTransition(async () => {
      const result = await subscribeToNewsletter(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess("Thank you for subscribing! Check your inbox for updates.")
        setEmail("") // Clear the email input on success
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-foreground">Stay Updated</h3>
        <p className="text-muted-foreground leading-relaxed">
          Get notified about new products, exclusive offers, and productivity tips delivered to your inbox.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-700/20 bg-red-700/5 text-center text-red-700 w-full">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-700/20 bg-green-700/5 text-center text-green-700 w-full">
          <Mail className="h-4 w-4" />
          <AlertDescription className="text-sm">{success}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          name="email"
          placeholder="Enter your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          className="flex-1 h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        <Button
          type="submit"
          size="default"
          className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
          {!isPending && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>
    </div>
  )
}
