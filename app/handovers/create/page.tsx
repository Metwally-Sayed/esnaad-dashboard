import { Metadata } from 'next'
import { CreateHandoverWrapper } from './_components/CreateHandoverWrapper'

export const metadata: Metadata = {
  title: 'Create Handover | Esnaad Dashboard',
  description: 'Create a new handover agreement',
}

export default function CreateHandoverPage() {
  return <CreateHandoverWrapper />
}
