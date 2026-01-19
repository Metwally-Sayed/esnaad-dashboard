import { Metadata } from 'next'
import { Suspense } from 'react'
import { VerifyOtpPage } from "./_components/VerifyOtpContent"

export const metadata: Metadata = {
  title: 'Verify OTP | Esnaad Dashboard',
  description: 'Verify your email address',
}

export default function VerifyOtp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  )
}
