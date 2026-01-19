/**
 * OTP Verification Page Component
 * Handles email verification with OTP code
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Mail, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft, Building2 } from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyOtp, resendOtp } = useAuth()

  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [resendTimer, setResendTimer] = useState(0)

  // Refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/register')
    }
  }, [email, router])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all digits entered
    if (newOtp.every(digit => digit) && newOtp.length === 6) {
      handleVerify(newOtp.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('')

    const newOtp = [...otp]
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }

    // Auto-submit if all digits entered
    if (newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''))
    }
  }

  // Verify OTP
  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('')

    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await verifyOtp({
        email,
        otp: code,
      })

      setSuccess(true)

      // Redirect to dashboard after successful verification
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error('OTP verification error:', err)

      // Handle specific error cases
      if (err.message?.includes('Invalid OTP')) {
        setError('Invalid verification code. Please check and try again.')
      } else if (err.message?.includes('expired')) {
        setError('Verification code has expired. Please request a new one.')
      } else if (err.message?.includes('Maximum attempts')) {
        setError('Maximum verification attempts exceeded. Please request a new code.')
      } else if (err.message?.includes('already verified')) {
        setError('This email is already verified. Please sign in.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(err.message || 'Verification failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (resendCount >= 3) {
      setError('Maximum resend attempts reached. Please contact support.')
      return
    }

    try {
      setIsResending(true)
      setError(null)
      setResendSuccess(false)

      await resendOtp({
        email,
      })

      setResendSuccess(true)
      setResendCount(resendCount + 1)
      setResendTimer(60) // 60 second cooldown
      setOtp(['', '', '', '', '', '']) // Clear OTP inputs

      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error('Resend OTP error:', err)

      if (err.message?.includes('Maximum resends')) {
        setError('Maximum resend attempts reached. Please contact support.')
      } else if (err.message?.includes('rate limit')) {
        setError('Too many requests. Please wait before trying again.')
        setResendTimer(60)
      } else {
        setError(err.message || 'Failed to resend code. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
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

        {/* Verification Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">Email verified!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your email has been verified successfully. Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            {/* Resend Success Alert */}
            {resendSuccess && (
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  A new verification code has been sent to your email.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    disabled={isLoading || success}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify()}
              className="w-full"
              size="lg"
              disabled={isLoading || success || !otp.every(digit => digit)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verified!
                </>
              ) : (
                'Verify Email'
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isResending || resendTimer > 0 || success}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend Code
                  </>
                )}
              </Button>
              {resendCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Resend attempts: {resendCount}/3
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/register')}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Registration
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Having trouble? <Link href="/support" className="text-primary hover:underline">Contact support</Link>
            </p>
          </CardFooter>
        </Card>

        {/* Tips */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2 text-sm">Tips:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• The code expires in 10 minutes</li>
              <li>• You can paste the code directly from your email</li>
              <li>• Make sure you're using the correct email address</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}