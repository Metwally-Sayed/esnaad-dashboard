import { Metadata } from 'next'
import { OwnerVerificationContent } from './_components/OwnerVerificationContent'

export const metadata: Metadata = {
  title: 'Owner Verification | Esnaad Dashboard',
  description: 'Manage owner document verifications',
}

export default function OwnerVerificationPage() {
  return <OwnerVerificationContent />
}
