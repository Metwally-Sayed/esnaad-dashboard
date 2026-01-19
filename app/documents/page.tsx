import { Metadata } from 'next'
import { DocumentsPage } from "./_components/DocumentsContent"

export const metadata: Metadata = {
  title: 'Documents | Esnaad Dashboard',
  description: 'Manage property documents',
}

export default function Documents() {
  return <DocumentsPage />
}
