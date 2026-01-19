import { Metadata } from 'next'
import { VerifyOtpContent } from './_components/VerifyOtpContent'

export const metadata: Metadata = {
  title: 'Verify Email | Esnaad Dashboard',
  description: 'Verify your email address with OTP',
}

export default function VerifyOtpPage() {
  return <VerifyOtpContent />
}
