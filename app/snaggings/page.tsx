import { Metadata } from 'next'
import { SnaggingsContent } from './_components/SnaggingsContent'

export const metadata: Metadata = {
  title: 'Snagging Reports | Esnaad Dashboard',
  description: 'View snagging inspection reports for your units',
}

export default function SnaggingsPage() {
  return <SnaggingsContent />
}
