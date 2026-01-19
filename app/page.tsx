import { Metadata } from 'next'
import { RootContent } from './_components/RootContent'

export const metadata: Metadata = {
  title: 'Esnaad Dashboard',
  description: 'Property management dashboard',
}

export default function HomePage() {
  return <RootContent />
}
