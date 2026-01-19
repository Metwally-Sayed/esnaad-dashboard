import { Metadata } from 'next'
import { ServiceChargeDetailContent } from './_components/ServiceChargeDetailContent'

export const metadata: Metadata = {
  title: 'Service Charge Details | Esnaad Admin',
  description: 'View and manage service charge details',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ServiceChargeDetailPage({ params }: Props) {
  const { id } = await params
  return <ServiceChargeDetailContent serviceChargeId={id} />
}
