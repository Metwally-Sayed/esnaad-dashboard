import { Metadata } from 'next'
import { HandoversContent } from './_components/HandoversContent'

export const metadata: Metadata = {
  title: 'Handovers | Esnaad Dashboard',
  description: 'Manage unit handover agreements and workflows',
}

export default function HandoversPage() {
  return <HandoversContent />
}
