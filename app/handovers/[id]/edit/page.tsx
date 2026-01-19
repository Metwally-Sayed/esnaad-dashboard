import { Metadata } from 'next'
import { HandoverEditContent } from './_components/HandoverEditContent'

export const metadata: Metadata = {
  title: 'Edit Handover | Esnaad Dashboard',
  description: 'Update handover agreement details',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function HandoverEditPage({ params }: Props) {
  const { id } = await params
  return <HandoverEditContent handoverId={id} />
}
