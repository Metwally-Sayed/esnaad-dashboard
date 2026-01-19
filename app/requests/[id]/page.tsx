import { Metadata } from 'next'
import { RequestDetailContent } from './_components/RequestDetailContent'

export const metadata: Metadata = {
  title: 'Request Details | Esnaad Dashboard',
  description: 'View and manage request details',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params
  return <RequestDetailContent requestId={id} />
}
