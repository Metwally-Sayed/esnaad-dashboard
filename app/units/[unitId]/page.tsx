import { Metadata } from 'next'
import { UnitDetailsPage } from './_components/UnitDetail'

export const metadata: Metadata = {
  title: 'Unit Details | Esnaad Dashboard',
  description: 'View unit details and information',
}

interface Props {
  params: Promise<{ unitId: string }>
}

export default async function UnitDetails({ params }: Props) {
  const { unitId } = await params
  return <UnitDetailsPage unitId={unitId} />
}
