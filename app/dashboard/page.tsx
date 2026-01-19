import { Metadata } from 'next'
import { DashboardWrapper } from './_components/DashboardWrapper'

export const metadata: Metadata = {
  title: 'Dashboard | Esnaad Dashboard',
  description: 'Property management dashboard',
}

export default function DashboardPage() {
  return <DashboardWrapper />
}
