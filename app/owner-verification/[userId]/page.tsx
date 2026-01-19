import { Metadata } from 'next'
import { VerificationDetailContent } from './_components/VerificationDetailContent'

export const metadata: Metadata = {
  title: 'Verification Details | Esnaad Dashboard',
  description: 'Review owner verification details',
}

interface Props {
  params: Promise<{ userId: string }>
}

export default async function VerificationDetailPage({ params }: Props) {
  const { userId } = await params
  return <VerificationDetailContent userId={userId} />
}
