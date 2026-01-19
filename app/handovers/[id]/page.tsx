import { Metadata } from 'next'
import { HandoverDetail } from './_components/HandoverDetail'

export const metadata: Metadata = {
  title: 'Handover Details | Esnaad Dashboard',
  description: 'View handover agreement details and manage handover workflow',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function HandoverDetailPage({ params }: Props) {
  const { id } = await params
  return <HandoverDetail handoverId={id} />
}
