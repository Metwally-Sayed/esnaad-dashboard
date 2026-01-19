'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Mail, Building2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

import { authService } from '@/lib/api/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import Link from 'next/link'

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

type OtpFormData = z.infer<typeof otpSchema>

export function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/login')
    } else if (process.env.NODE_ENV === 'development') {
      console.log('==========================================')
      console.log('📧 Email Verification Page')
      console.log('Email:', email)
      console.log('💡 TIP: Check backend console for OTP or click "Resend OTP"')
      console.log('==========================================')
    }
  }, [email, router])

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const onSubmit = async (data: OtpFormData) => {
    if (!email) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await authService.verifyOtp({
        email,
        otp: data.otp,
      })

      if (response.success) {
        setSuccessMessage('Email verified successfully! Redirecting to dashboard...')
        toast.success('Email verified successfully!')

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (err: any) {
      console.error('OTP verification error:', err)

      if (err.message?.includes('Invalid OTP')) {
        setError('Invalid OTP. Please check and try again.')
      } else if (err.message?.includes('expired')) {
        setError('OTP has expired. Please request a new one.')
      } else if (err.message?.includes('Maximum')) {
        setError('Too many failed attempts. Please request a new OTP.')
      } else {
        setError(err.message || 'Failed to verify OTP. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!email) return

    try {
      setIsResending(true)
      setError(null)

      const response = await authService.resendOtp({ email })

      if (response.success) {
        toast.success('OTP sent successfully!')
        setResendCountdown(60) // 60 second cooldown

        // Show OTP in development
        if (process.env.NODE_ENV === 'development' && response.data) {
          const otpValue = (response.data as any).otp
          if (otpValue) {
            console.log('==========================================')
            console.log('🔐 DEVELOPMENT OTP CODE:', otpValue)
            console.log('==========================================')
            toast.info(`Development OTP: ${otpValue}`)
          }
        }
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err)

      if (err.message?.includes('Maximum')) {
        setError('Maximum resend limit reached. Please contact support.')
      } else {
        setError(err.message || 'Failed to resend OTP. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Esnaad</h1>
          </div>
          <p className="text-muted-foreground">Property Management Dashboard</p>
        </div>

        {/* Verify OTP Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Success Alert */}
                {successMessage && (
                  <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* OTP Field */}
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter OTP Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest font-mono"
                          disabled={isLoading || !!successMessage}
                          autoComplete="one-time-code"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || !!successMessage}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>

                {/* Resend OTP */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendOtp}
                    disabled={isResending || resendCountdown > 0 || !!successMessage}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : resendCountdown > 0 ? (
                      `Resend in ${resendCountdown}s`
                    ) : (
                      <>
                        <Mail className="mr-2 h-3 w-3" />
                        Resend OTP
                      </>
                    )}
                  </Button>
                </div>

                {/* Back to Login */}
                <div className="text-center pt-4">
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Check your spam folder if you don't see the email.</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-yellow-600 dark:text-yellow-500 font-medium">
              Development: OTP is shown in toast notification
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
