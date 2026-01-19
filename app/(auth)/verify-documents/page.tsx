import { Metadata } from 'next'
import { VerifyDocumentsContent } from './_components/VerifyDocumentsContent'

export const metadata: Metadata = {
  title: 'Verify Documents | Esnaad Dashboard',
  description: 'Upload your passport and national ID for verification',
}

export default function VerifyDocumentsPage() {
  return <VerifyDocumentsContent />
}
