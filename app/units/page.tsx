import { Metadata } from 'next'
import { UnitsPage } from './_components/UnitsContent'

export const metadata: Metadata = {
  title: 'Units | Esnaad Dashboard',
  description: 'Manage and monitor property units',
}

export default function Units() {
  return <UnitsPage />
}
