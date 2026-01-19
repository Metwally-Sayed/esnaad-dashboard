import { Metadata } from 'next'
import { NewRequestContent } from './_components/NewRequestContent'

export const metadata: Metadata = {
  title: 'New Request | Esnaad Dashboard',
  description: 'Submit a new guest visit invitation or work permission request',
}

export default function NewRequestPage() {
  return <NewRequestContent />
}
