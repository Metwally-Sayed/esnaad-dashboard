import { Metadata } from 'next'
import { SnaggingDetailWrapper } from './_components/SnaggingDetailWrapper'

export const metadata: Metadata = {
  title: 'Snagging Details | Esnaad Dashboard',
  description: 'View snagging report details',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function SnaggingDetailPage({ params }: Props) {
  const { id } = await params
  return <SnaggingDetailWrapper snaggingId={id} />
}
