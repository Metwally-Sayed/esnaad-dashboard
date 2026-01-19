import { Metadata } from 'next'
import { UnitEditWrapper } from './_components/UnitEditWrapper'

export const metadata: Metadata = {
  title: 'Edit Unit | Esnaad Dashboard',
  description: 'Edit property unit details',
}

interface Props {
  params: Promise<{ unitId: string }>
}

export default async function UnitEditPage({ params }: Props) {
  const { unitId } = await params
  return <UnitEditWrapper unitId={unitId} />
}
