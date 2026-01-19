import { Metadata } from 'next'
import { RequestsContent } from './_components/RequestsContent'

export const metadata: Metadata = {
  title: 'Delivered Requests | Esnaad Dashboard',
  description: 'Manage your delivered requests',
}

export default function RequestsPage() {
  return <RequestsContent />
}
