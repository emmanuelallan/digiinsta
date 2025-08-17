"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendOtp, verifyOtp, signInWithGoogle } from "@/actions/admin/auth"
import { Loader2, Mail, ArrowLeft } from "lucide-react"

type Step = "email" | "otp"

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEmailPending, startEmailTransition] = useTransition()
  const [isGooglePending, startGoogleTransition] = useTransition()
  const [isOtpPending, startOtpTransition] = useTransition()

  const handleEmailSubmit = async (formData: FormData) => {
    setError("")
    setSuccess("")

    startEmailTransition(async () => {
      const result = await sendOtp(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setEmail(formData.get("email") as string)
        setSuccess("We've sent a 6-digit code to your email. Please check your inbox.")
        setStep("otp")
      }
    })
  }

  const handleOtpComplete = (otp: string) => {
    setError("")

    const formData = new FormData()
    formData.append("email", email)
    formData.append("otp", otp)

    startOtpTransition(async () => {
      const result = await verifyOtp(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push("/admin/dashboard")
      }
    })
  }

  const handleGoogleSignIn = () => {
    setError("")
    startGoogleTransition(async () => {
      const result = await signInWithGoogle()
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleBackToEmail = () => {
    setStep("email")
    setError("")
    setSuccess("")
  }

  return (
    <div className="flex items-center justify-center p-4 py-8">
      <div className="w-full sm:w-[400px]">

        {/* Form Card */}
        <Card className="border-0 shadow-lg bg-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-medium text-foreground">
              {step === "email" ? "Sign in to Admin" : "Enter verification code"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {step === "email" ? "Enter your email to receive a verification code" : `We sent a 6-digit code to ${email}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6 pb-4">
            <div className="flex items-center">
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
            </div>

            {step === "email" ? (
              <>
                <form action={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      required
                      disabled={isEmailPending || isGooglePending}
                      className="h-11 px-4 text-sm border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
                    disabled={isEmailPending || isGooglePending}
                  >
                    {isEmailPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Send verification code"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground font-medium">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium border-border bg-background hover:bg-muted/50 transition-colors"
                  onClick={handleGoogleSignIn}
                  disabled={isEmailPending || isGooglePending}
                >
                  {isGooglePending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <InputOTP 
                      maxLength={6} 
                      onComplete={handleOtpComplete} 
                      disabled={isOtpPending}
                      className="gap-2"
                    >
                      {[0, 3].map((startIndex, groupIndex) => (
                        <InputOTPGroup key={groupIndex} className="gap-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <InputOTPSlot 
                              key={startIndex + i} 
                              index={startIndex + i}
                              className="h-11 w-11 text-lg font-medium border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                          ))}
                          {groupIndex === 0 && <InputOTPSeparator className="mx-2" />}
                        </InputOTPGroup>
                      ))}
                    </InputOTP>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <span>Didn&apos;t receive the code?</span>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-normal text-primary hover:text-primary/80"
                      onClick={() => {
                        const formData = new FormData()
                        formData.append("email", email)
                        handleEmailSubmit(formData)
                      }}
                      disabled={isOtpPending || isEmailPending}
                    >
                      Resend
                    </Button>
                  </div>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full h-11 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" 
                    onClick={handleBackToEmail} 
                    disabled={isOtpPending}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to email
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Protected by secure authentication
          </p>
        </div>
      </div>
    </div>
  )
}
